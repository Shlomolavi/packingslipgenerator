// Simple in-memory storage for MVP production safety (Hardened)
// Uses globalThis to survive module reloading in dev/some serverless contexts

export interface AnalyticsEvent {
    id: string;
    ts: string;
    event_name: string;
    tool_mode: string;
    landing_context: string;
    properties: string; // JSON string
}

// Global augmentation
const globalStore = globalThis as unknown as { _analyticsEvents: AnalyticsEvent[] };

if (!globalStore._analyticsEvents) {
    globalStore._analyticsEvents = [];
}

const events = globalStore._analyticsEvents;

export function getDb() {
    return { events };
}

export function insertEvent(evt: AnalyticsEvent) {
    events.push(evt);
    // Limit to 1000 events to prevent memory leak
    if (events.length > 1000) {
        events.shift();
    }
}

export function getAllEvents() {
    return events;
}
