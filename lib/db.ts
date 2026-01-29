import { createClient } from '@vercel/kv';
import Redis from 'ioredis';

// --- Types ---

export const METRICS_KEY = 'metrics:events';

export type AnalyticEvent = {
    id: string;
    ts: string;
    event_name: string;
    tool_mode: 'single' | 'bulk' | 'unknown';
    landing_context: 'bulk_landing' | 'home' | 'tool_other' | 'unknown';
    properties: string; // JSON string
};

export interface KVInterface {
    lpush<T>(key: string, value: T): Promise<number>;
    lrange<T>(key: string, start: number, end: number): Promise<T[]>;
    llen(key: string): Promise<number>;
}

// --- Environment Detection ---

type EnvConfig = {
    type: 'VERCEL_KV' | 'REDIS_URL' | 'STORAGE_KV' | 'MISSING';
    url?: string;
    token?: string;
    redisUrl?: string; // for ioredis
}

// Lazy load config to avoid build-time errors if env vars are missing
let _envConfig: EnvConfig | null = null;

const getEnvConfig = (): EnvConfig => {
    if (_envConfig) return _envConfig;

    // 1. Check for standard @vercel/kv credentials (HTTP)
    // Priority: Explicit KV_REST_API... vars
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        _envConfig = {
            type: 'VERCEL_KV',
            url: process.env.KV_REST_API_URL,
            token: process.env.KV_REST_API_TOKEN
        };
        return _envConfig;
    }

    // 2. Check for REDIS_URL (Standard Redis Protocol)
    if (process.env.REDIS_URL && process.env.REDIS_URL.startsWith('redis')) {
        _envConfig = {
            type: 'REDIS_URL',
            redisUrl: process.env.REDIS_URL
        };
        return _envConfig;
    }

    // 3. Fallback: Check for STORAGE_ prefixed vars (Vercel Storage integration sometimes uses this)
    if (process.env.STORAGE_REST_API_URL && process.env.STORAGE_REST_API_TOKEN) {
        _envConfig = {
            type: 'STORAGE_KV',
            url: process.env.STORAGE_REST_API_URL,
            token: process.env.STORAGE_REST_API_TOKEN
        };
        return _envConfig;
    }

    _envConfig = { type: 'MISSING' };
    return _envConfig;
}

export const getKvEnvScheme = () => getEnvConfig().type;
export const KV_ENV_SCHEME = getKvEnvScheme(); // For export compatibility, but better to call function if possible. 
// Actually, to keep route.ts working without change (import { KV_ENV_SCHEME }), we can export a getter or just the variable.
// But since we want lazy loading, accessing KV_ENV_SCHEME directly at top level might trigger env check. 
// However, env check is safe (just process.env access). The CLIENT init is what crashes if missing.
// So safe to export KV_ENV_SCHEME derived from getEnvConfig() immediately.


// --- Client Implementations ---

class VercelHttpKv implements KVInterface {
    private client: ReturnType<typeof createClient>;

    constructor(url: string, token: string) {
        this.client = createClient({ url, token });
    }

    async lpush<T>(key: string, value: T): Promise<number> {
        return await this.client.lpush(key, value);
    }

    async lrange<T>(key: string, start: number, end: number): Promise<T[]> {
        return await this.client.lrange<T>(key, start, end);
    }

    async llen(key: string): Promise<number> {
        return await this.client.llen(key);
    }
}

class StandardRedisKv implements KVInterface {
    private client: Redis;

    constructor(url: string) {
        this.client = new Redis(url);
    }

    async lpush<T>(key: string, value: T): Promise<number> {
        // Redis stores strings. Serialize if object.
        const val = typeof value === 'object' ? JSON.stringify(value) : String(value);
        return await this.client.lpush(key, val);
    }

    async lrange<T>(key: string, start: number, end: number): Promise<T[]> {
        const items = await this.client.lrange(key, start, end);
        // Deserialize
        return items.map(item => {
            try {
                return JSON.parse(item);
            } catch (e) {
                return item as unknown as T;
            }
        });
    }

    async llen(key: string): Promise<number> {
        return await this.client.llen(key);
    }
}

class MissingKv implements KVInterface {
    async lpush<T>(key: string, value: T): Promise<number> { return 0; }
    async lrange<T>(key: string, start: number, end: number): Promise<T[]> { return []; }
    async llen(key: string): Promise<number> { return 0; }
}

// --- Lazy Singleton ---

let _kvInstance: KVInterface | null = null;

const getKvClient = (): KVInterface => {
    if (_kvInstance) return _kvInstance;

    const config = getEnvConfig();

    if (config.type === 'VERCEL_KV' || config.type === 'STORAGE_KV') {
        _kvInstance = new VercelHttpKv(config.url!, config.token!);
    } else if (config.type === 'REDIS_URL') {
        _kvInstance = new StandardRedisKv(config.redisUrl!);
    } else {
        console.warn('No Redis configuration found. Analytics will be disabled.');
        _kvInstance = new MissingKv();
    }

    return _kvInstance;
};

// Export a proxy object that delegates to the lazy client
// This ensures we don't init the client until a method is actually called.
// This is critical for build time safety.

export const kv: KVInterface = {
    lpush: (k, v) => getKvClient().lpush(k, v),
    lrange: (k, s, e) => getKvClient().lrange(k, s, e),
    llen: (k) => getKvClient().llen(k),
};
