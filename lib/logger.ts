import { insertEvent } from './db';
import { randomUUID } from 'crypto';

export type EventPayload = {
    tool_mode?: 'single' | 'bulk';
    landing_context?: 'bulk_landing' | 'home' | 'tool_other' | 'unknown';
    [key: string]: any;
};

export function logEvent(event_name: string, payload: EventPayload) {
    try {
        const { tool_mode, landing_context, ...rest } = payload;

        // Fail-safe defaults
        const safeToolMode = tool_mode || 'unknown';
        const safeContext = landing_context || 'unknown';

        insertEvent({
            id: randomUUID(),
            ts: new Date().toISOString(),
            event_name,
            tool_mode: safeToolMode,
            landing_context: safeContext,
            properties: JSON.stringify(rest)
        });
    } catch (error) {
        // Analytics must be fail-safe. Do not throw, but log error for debugging.
        console.error('[Analytics Error] Failed to log event:', event_name, error);
    }
}
