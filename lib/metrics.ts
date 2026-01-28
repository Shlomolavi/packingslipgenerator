import { getDb } from './db';
import path from 'path';

// Time helpers
const NOW = () => new Date();
const DAYS_AGO = (days: number) => new Date(NOW().getTime() - days * 24 * 60 * 60 * 1000).toISOString();

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
    footerToBulk: { d7: number };
}

export function getDashboardMetrics(): DashboardMetrics {
    const db = getDb();
    const d7 = DAYS_AGO(7);
    const d14 = DAYS_AGO(14);

    // Helpers
    const count = (event: string, since: string, filter?: string) => {
        let sql = `SELECT COUNT(*) as c FROM events WHERE event_name = ? AND ts >= ?`;
        if (filter) sql += ` AND ${filter}`;
        const row = db.prepare(sql).get(event, since) as { c: number };
        return row.c;
    };

    // Overview
    const bulkUploads7 = count('bulk_csv_uploaded', d7);
    const bulkUploads14 = count('bulk_csv_uploaded', d14);
    const singleGenerated7 = count('single_order_generated', d7);
    const singleGenerated14 = count('single_order_generated', d14);

    // Bulk Funnel (Using uploads as top of funnel here as requested)
    // The prompt asks for "bulk_csv_uploaded" count for funnel.
    // If we had more steps wired, we'd add them, but for now just this one is requested/wired fully in previous step?
    // Step 2 wired: single_order_generated, bulk_csv_uploaded, footer_navigation_clicked.
    // So funnel is just the upload count for now.

    // Distribution (7d)
    const bulkEvents = db.prepare(`
        SELECT properties FROM events 
        WHERE event_name = 'bulk_csv_uploaded' AND ts >= ?
    `).all(d7) as { properties: string }[];

    const dist: Record<string, number> = {
        '1-3': 0, '4-10': 0, '11-25': 0, '26-50': 0, '51-100': 0
    };

    bulkEvents.forEach(evt => {
        try {
            const props = JSON.parse(evt.properties);
            const cnt = props.orders_count || 0;
            if (cnt > 0) {
                if (cnt <= 3) dist['1-3']++;
                else if (cnt <= 10) dist['4-10']++;
                else if (cnt <= 25) dist['11-25']++;
                else if (cnt <= 50) dist['26-50']++;
                else if (cnt <= 100) dist['51-100']++;
            }
        } catch (e) { }
    });

    // Footer -> Bulk (7d)
    const footerEvents = db.prepare(`
        SELECT properties FROM events 
        WHERE event_name = 'footer_navigation_clicked' AND ts >= ?
    `).all(d7) as { properties: string }[];

    let footerBulkCount = 0;
    footerEvents.forEach(evt => {
        try {
            const props = JSON.parse(evt.properties);
            if (props.destination_type === 'bulk') footerBulkCount++;
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
        footerToBulk: { d7: footerBulkCount }
    };
}

export function getDebugInfo() {
    const db = getDb();
    const total = db.prepare('SELECT COUNT(*) as c FROM events').get() as { c: number };
    const recent = db.prepare('SELECT event_name, ts, tool_mode FROM events ORDER BY ts DESC LIMIT 10').all();

    return {
        dbPath: path.join(process.cwd(), 'analytics.db'),
        totalEvents: total.c,
        recentEvents: recent
    };
}
