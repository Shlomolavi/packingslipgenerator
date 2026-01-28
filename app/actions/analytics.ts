'use server';

import { logEvent as logToDb, EventPayload } from '../../lib/logger';

export async function logEvent(eventName: string, payload: EventPayload) {
    // Bridge to internal logger (which uses better-sqlite3)
    // Server Actions run on the server, so they can access the DB directly.
    logToDb(eventName, payload);
}
