import { getDb } from './db';
import { randomUUID } from 'crypto';

export type EventPayload = {
    tool_mode?: 'single' | 'bulk';
    landing_context?: 'bulk_landing' | 'home' | 'tool_other' | 'unknown';
    [key: string]: any;
};

export function logEvent(event_name: string, payload: EventPayload) {
    try {
        const db = getDb();
        const stmt = db.prepare(`
            INSERT INTO events (id, ts, event_name, tool_mode, landing_context, properties)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        const { tool_mode, landing_context, ...rest } = payload;

        // Fail-safe defaults
        const safeToolMode = tool_mode || 'unknown';
        const safeContext = landing_context || 'unknown';

        stmt.run(
            randomUUID(),
            new Date().toISOString(),
            event_name,
            safeToolMode,
            safeContext,
            JSON.stringify(rest)
        );
    } catch (error) {
        // Analytics must be fail-safe. Do not throw.
        console.error('Analytics logEvent failed:', error);
    }
}
