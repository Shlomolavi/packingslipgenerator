// Client-side helper to call the internal analytics API

const showDebugToast = (message: string, isError: boolean) => {
    if (typeof window === 'undefined') return;

    // Check for query param ?debug_metrics=1
    const params = new URLSearchParams(window.location.search);
    if (!params.has('debug_metrics')) return;

    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.padding = '12px 24px';
    toast.style.backgroundColor = isError ? '#fee2e2' : '#dcfce7'; // red-100 : green-100
    toast.style.color = isError ? '#991b1b' : '#166534'; // red-800 : green-800
    toast.style.border = `1px solid ${isError ? '#ef4444' : '#22c55e'}`;
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    toast.style.zIndex = '9999';
    toast.style.fontFamily = 'monospace';
    toast.style.fontSize = '14px';
    toast.textContent = message;

    document.body.appendChild(toast);

    // Fade out
    setTimeout(() => {
        toast.style.transition = 'opacity 0.5s ease-out';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
};

export const logEventClient = async (eventName: string, payload: any = {}) => {
    try {
        const res = await fetch('/api/internal-event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event_name: eventName,
                ...payload
            }),
            keepalive: true,
        });

        if (!res.ok) {
            throw new Error(`Status ${res.status}`);
        }

        showDebugToast(`${eventName} metrics sent ✅`, false);

    } catch (error) {
        // Silent fail on client side normally, but show toast if debug mode
        showDebugToast(`${eventName} metrics failed ❌ (${error})`, true);

        if (process.env.NODE_ENV === 'development') {
            console.error('[Analytics Client] Failed to send event:', eventName, error);
        }
    }
};
