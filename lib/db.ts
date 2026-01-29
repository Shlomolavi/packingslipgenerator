// Simple in-memory storage for MVP production safety
// Note: This data is ephemeral and will reset on server restarts/lambda cold starts.
// This is acceptable for the current user requirement.

export interface AnalyticsEvent {
    id: string;
    ts: string;
    event_name: string;
    tool_mode: string;
    landing_context: string;
    properties: string; // JSON string
}

// Global store
const events: AnalyticsEvent[] = [];

export function getDb() {
    return {
        // Mocking the "prepare" interface used by callers roughly, or better:
        // changing the callers directly. I will change the callers to use this object directly
        // via helper methods exposed here, OR I will just export the array.
        // But to minimize caller churn, maybe I can expose a clear API.

        // Actually, let's just export the accessors.
        events
    };
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
