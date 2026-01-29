import { createClient } from '@vercel/kv';

// 1. Try "REDIS_URL" (Vercel Redis generic)
// 2. Try "KV_..." (Official Vercel KV)
// 3. Try "STORAGE_..." (Vercel Storage integration default sometimes)
const getEnv = () => {
    // Check REDIS_URL first
    if (process.env.REDIS_URL) {
        return {
            url: process.env.REDIS_URL,
            // If REDIS_TOKEN exists, use it. Otherwise, assume URL has auth or client handles it.
            token: process.env.REDIS_TOKEN || process.env.KV_REST_API_TOKEN || '',
            scheme: 'REDIS_URL' as const
        };
    }

    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        return {
            url: process.env.KV_REST_API_URL,
            token: process.env.KV_REST_API_TOKEN,
            scheme: 'KV' as const
        };
    }
    if (process.env.STORAGE_REST_API_URL && process.env.STORAGE_REST_API_TOKEN) {
        return {
            url: process.env.STORAGE_REST_API_URL,
            token: process.env.STORAGE_REST_API_TOKEN,
            scheme: 'STORAGE' as const
        };
    }
    return {
        url: '',
        token: '',
        scheme: 'MISSING' as const
    };
};

const envConfig = getEnv();

export const KV_ENV_SCHEME = envConfig.scheme;

// KV Client
// Safe to call even if env vars missing (operations will fail gracefully in logger)
export const kv = createClient({
    url: envConfig.url,
    token: envConfig.token,
});

export const METRICS_KEY = 'metrics:events';

export type AnalyticEvent = {
    id: string;
    ts: string;
    event_name: string;
    tool_mode: 'single' | 'bulk' | 'unknown';
    landing_context: 'bulk_landing' | 'home' | 'tool_other' | 'unknown';
    properties: string; // JSON string
};
