import { kv, METRICS_KEY, AnalyticEvent } from './db';

// Time helpers
const NOW = () => new Date();
const DAYS_AGO = (days: number) => {
    const d = new Date(NOW().getTime() - days * 24 * 60 * 60 * 1000);
    return d.toISOString();
};

export interface DashboardMetrics {
    overview: {
        bulkUploads: { d7: number, d14: number };
        singleGenerated: { d7: number, d14: number };
    };
    bulkFunnel: {
        d7: number;
        d14: number;
    };
    ordersDist: Record<string, number>;
    footerToBulk: { byMode: number, byProps: number };
}

async function getAllEvents(): Promise<AnalyticEvent[]> {
    try {
        // Fetch all events. Range 0 -1 means everything.
        // KV returns list of objects if we stored them as JSON objects (vercel/kv client handles serialization often),
        // OR it returns strings? 
        // @vercel/kv client automatically serializes/deserializes JSON if we pass objects.
        // So `kv.lrange` should return AnalyticEvent[] directly.

        const events = await kv.lrange<AnalyticEvent>(METRICS_KEY, 0, -1);
        return events || [];
    } catch (e) {
        console.error('Failed to fetch events from KV:', e);
        return [];
    }
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
    const events = await getAllEvents();
    const d7 = DAYS_AGO(7);
    const d14 = DAYS_AGO(14);

    // Helpers
    const count = (eventName: string, since: string, filterFn?: (e: AnalyticEvent) => boolean) => {
        return events.filter(e => {
            if (e.event_name !== eventName) return false;
            // Lexical comparison of ISO strings works for dates
            if (e.ts < since) return false;
            if (filterFn && !filterFn(e)) return false;
            return true;
        }).length;
    };

    // Overview
    const bulkUploads7 = count('bulk_csv_upload_success', d7);
    const bulkUploads14 = count('bulk_csv_upload_success', d14);
    const singleGenerated7 = count('single_pdf_generated', d7);
    const singleGenerated14 = count('single_pdf_generated', d14);

    // Distribution (7d)
    const bulkEvents = events.filter(e => e.event_name === 'bulk_csv_upload_success' && e.ts >= d7);

    const dist: Record<string, number> = {
        '1-3': 0, '4-10': 0, '11-25': 0, '26-50': 0, '51-100': 0
    };

    bulkEvents.forEach(evt => {
        try {
            const props = JSON.parse(evt.properties);
            // Use stored bucket directly. Do NOT re-calculate.
            const bucket = props.order_size_bucket;
            if (bucket && dist.hasOwnProperty(bucket)) {
                dist[bucket]++;
            }
        } catch (e) { }
    });

    // Footer -> Bulk (7d)
    const footerBulkMode = count('footer_navigation_clicked', d7, (e) => e.tool_mode === 'bulk');

    const footerEvents = events.filter(e => e.event_name === 'footer_navigation_clicked' && e.ts >= d7);
    let footerBulkProps = 0;
    footerEvents.forEach(evt => {
        try {
            const props = JSON.parse(evt.properties);
            if (props.destination_type === 'bulk') footerBulkProps++;
        } catch (e) { }
    });

    return {
        overview: {
            bulkUploads: { d7: bulkUploads7, d14: bulkUploads14 },
            singleGenerated: { d7: singleGenerated7, d14: singleGenerated14 }
        },
        bulkFunnel: {
            d7: bulkUploads7,
            d14: bulkUploads14
        },
        ordersDist: dist,
        footerToBulk: { byMode: footerBulkMode, byProps: footerBulkProps }
    };
}

export async function getDebugInfo() {
    try {
        // Fetch only recent 20 events for debug info to save bandwidth if list is huge
        // But to get total count, we need LLEN
        const totalEvents = await kv.llen(METRICS_KEY);

        // Get recent events (first 10)
        // Since we LPUSH, 0 is the newest.
        const recent = await kv.lrange<AnalyticEvent>(METRICS_KEY, 0, 9);

        // Find last footer event - this requires scanning. 
        // For MVP/Internal efficiency, let's just scan the top 100. If it's not there, say "Not in recent 100".
        const top100 = await kv.lrange<AnalyticEvent>(METRICS_KEY, 0, 99);
        const lastFooter = top100.find(e => e.event_name === 'footer_navigation_clicked');

        // Find last bulk upload to verify bucketing
        const lastBulk = top100.find(e => e.event_name === 'bulk_csv_upload_success');
        let lastBulkInfo = null;
        if (lastBulk) {
            try {
                const p = JSON.parse(lastBulk.properties);
                lastBulkInfo = {
                    orders_count: p.orders_count,
                    rows_count: p.rows_count,
                    order_size_bucket: p.order_size_bucket
                };
            } catch (e) { }
        }

        return {
            dbPath: 'Vercel KV (Redis)',
            totalEvents,
            recentEvents: recent,
            lastFooterEvent: lastFooter || null,
            lastBulkEvent: lastBulkInfo
        };
    } catch (e) {
        return {
            dbPath: 'Vercel KV (Error)',
            totalEvents: 0,
            recentEvents: [],
            lastFooterEvent: null,
            lastBulkEvent: null
        };
    }
}
