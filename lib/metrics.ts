import { getAllEvents } from './db';
import path from 'path';

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

export function getDashboardMetrics(): DashboardMetrics {
    const events = getAllEvents();
    const d7 = DAYS_AGO(7);
    const d14 = DAYS_AGO(14);

    // Helpers
    const count = (eventName: string, since: string, filterFn?: (e: any) => boolean) => {
        return events.filter(e => {
            if (e.event_name !== eventName) return false;
            if (e.ts < since) return false;
            if (filterFn && !filterFn(e)) return false;
            return true;
        }).length;
    };

    // Overview
    const bulkUploads7 = count('bulk_csv_upload_success', d7);
    const bulkUploads14 = count('bulk_csv_upload_success', d14);
    const singleGenerated7 = count('single_order_generated', d7);
    const singleGenerated14 = count('single_order_generated', d14);

    // Distribution (7d)
    const bulkEvents = events.filter(e => e.event_name === 'bulk_csv_upload_success' && e.ts >= d7);

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

export function getDebugInfo() {
    // Return safe debug info
    const events = getAllEvents();

    // Recent events: Sort by TS desc, limit 10
    const sorted = [...events].sort((a, b) => b.ts.localeCompare(a.ts));
    const recent = sorted.slice(0, 10);

    const lastFooter = sorted.find(e => e.event_name === 'footer_navigation_clicked');

    return {
        dbPath: 'In-Memory (Ephemeral)',
        totalEvents: events.length,
        recentEvents: recent,
        lastFooterEvent: lastFooter || null
    };
}
