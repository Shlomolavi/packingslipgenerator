import { createClient } from '@vercel/kv';

// KV Client (Auto-configures from env vars: KV_REST_API_URL, KV_REST_API_TOKEN)
// Safe to call even if env vars missing (operations will fail gracefully in logger)
export const kv = createClient({
    url: process.env.KV_REST_API_URL || '',
    token: process.env.KV_REST_API_TOKEN || '',
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
