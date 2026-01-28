// Client-side helper to call the internal analytics API

export const logEventClient = async (eventName: string, payload: any = {}) => {
    try {
        await fetch('/api/internal-event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event_name: eventName,
                ...payload
            }),
        });
    } catch (error) {
        // Silent fail on client side to avoid disrupting user experience
        if (process.env.NODE_ENV === 'development') {
            console.error('[Analytics Client] Failed to send event:', eventName, error);
        }
    }
};
