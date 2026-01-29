import { kv, METRICS_KEY } from './db';
import { randomUUID } from 'crypto';

export type EventPayload = {
    tool_mode?: 'single' | 'bulk';
    landing_context?: 'bulk_landing' | 'home' | 'tool_other' | 'unknown';
    [key: string]: any;
};

export async function logEvent(event_name: string, payload: EventPayload) {
    try {
        const { tool_mode, landing_context, ...rest } = payload;

        // Fail-safe defaults
        const safeToolMode = tool_mode || 'unknown';
        const safeContext = landing_context || 'unknown';

        const event = {
            id: randomUUID(),
            ts: new Date().toISOString(),
            event_name,
            tool_mode: safeToolMode,
            landing_context: safeContext,
            properties: JSON.stringify(rest)
        };

        // Push to KV list (Tail)
        // We use lpush to prepend, or rpush to append.
        // Let's use LPUSH so index 0 is always the newest event (easier for "Recent Events")
        await kv.lpush(METRICS_KEY, event);

        // Optional: Trim to keep only last 10k events to avoid storage explosion
        // await kv.ltrim(METRICS_KEY, 0, 9999); 

    } catch (error) {
        // Analytics must be fail-safe. Do not throw, but log error for debugging.
        console.error('[Analytics Error] Failed to log event:', event_name, error);
    }
}
