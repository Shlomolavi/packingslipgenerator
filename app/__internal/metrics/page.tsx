import { prisma } from "../../actions/analytics";

// Force dynamic to ensure data is fresh
export const dynamic = "force-dynamic";

export default async function InternalMetricsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // 1. Simple Security Check
    // In strict mode, use process.env.INTERNAL_METRICS_KEY
    // For this MVP, we will just proceed, or check a query param if desired
    // as per prompt "simple env secret or basic password".
    // Let's implement a query param check ?key=secret (MVP)
    const sp = await searchParams;
    const key = sp.key;
    const secret = process.env.INTERNAL_METRICS_KEY || "secret"; // Default for MVP dev

    // Allow access if key matches or if clearly in development
    // BUT prompt says "No auth system (simple internal protection)".
    // I'll show a "Unauthorized" if key doesn't match, unless no key is set in env.
    if (key !== secret) {
        return <div className="p-10 font-mono text-red-600">Unauthorized access.</div>;
    }

    // 2. Fetch Data
    const now = new Date();
    const ago7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const ago14d = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Helper to get counts
    const getCount = async (eventName: string, mode?: string, since: Date = ago7d) => {
        return await prisma.event.count({
            where: {
                event_name: eventName,
                tool_mode: mode,
                ts: { gte: since },
            }
        });
    };

    // Usage Overview (Last 7 Days)
    const bulkUsage7d = await getCount('bulk_generate_success', 'bulk', ago7d);
    const singleUsage7d = await getCount('single_order_generated', 'single', ago7d);

    const bulkUsage14d = await getCount('bulk_generate_success', 'bulk', ago14d);
    const singleUsage14d = await getCount('single_order_generated', 'single', ago14d);

    // Bulk Funnel (Last 7 Days)
    const bulkUploaded = await getCount('bulk_csv_uploaded', 'bulk');
    const bulkGenClicked = await getCount('bulk_generate_clicked', 'bulk');
    const bulkLimitHit = await getCount('bulk_limit_hit', 'bulk');
    const bulkSuccess = await getCount('bulk_generate_success', 'bulk');
    const bulkDownloaded = await getCount('zip_downloaded', 'bulk');

    // Orders Distribution (Raw Loop for MVP - Prisma doesn't do complex range grouping easily in SQLite without raw query)
    // We will fetch properties for 'bulk_generate_success' and categorize in JS
    const bulkSuccessEvents = await prisma.event.findMany({
        where: {
            event_name: 'bulk_generate_success',
            ts: { gte: ago7d }
        },
        select: { properties: true }
    });

    const dist = {
        '1-3': 0,
        '4-10': 0,
        '11-25': 0,
        '26-50': 0,
        '51-100': 0
    };

    bulkSuccessEvents.forEach(e => {
        try {
            const props = JSON.parse(e.properties);
            const count = props.orders_count || 0;
            if (count <= 3) dist['1-3']++;
            else if (count <= 10) dist['4-10']++;
            else if (count <= 25) dist['11-25']++;
            else if (count <= 50) dist['26-50']++;
            else dist['51-100']++;
        } catch { }
    });

    // Landing Context (Last 7 Days)
    // Group by Landing Context for 'bulk_csv_uploaded'? Or generally?
    // Let's look at 'bulk_csv_uploaded' context
    const landingContextRaw = await prisma.event.groupBy({
        by: ['landing_context'],
        where: {
            tool_mode: 'bulk',
            ts: { gte: ago7d }
        },
        _count: {
            landing_context: true
        }
    });

    // Footer Discovery
    const footerClicks = await prisma.event.count({
        where: {
            event_name: 'footer_navigation_clicked',
            ts: { gte: ago7d }
        }
    });

    // Breakdown of footer clicks (destination_type = bulk vs others)
    // We need to parse properties for this in SQLite/Prisma if we didn't extract it to column.
    // Since 'destination_type' is in properties JSON, we interpret in JS.
    const footerEvents = await prisma.event.findMany({
        where: {
            event_name: 'footer_navigation_clicked',
            ts: { gte: ago7d }
        },
        select: { properties: true }
    });

    let footerToBulk = 0;
    footerEvents.forEach(e => {
        try {
            const p = JSON.parse(e.properties);
            if (p.destination_type === 'bulk') footerToBulk++;
        } catch { }
    });


    return (
        <div className="min-h-screen bg-gray-50 p-8 font-mono text-gray-800">
            <h1 className="text-3xl font-bold mb-8 border-b pb-4">Internal Metrics (MVP)</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {/* Usage Overview */}
                <Card title="Usage Overview (7d / 14d)">
                    <Stat label="Bulk Succcess" val7={bulkUsage7d} val14={bulkUsage14d} />
                    <Stat label="Single Generated" val7={singleUsage7d} val14={singleUsage14d} />
                </Card>

                {/* Bulk Funnel */}
                <Card title="Bulk Funnel (7d)">
                    <Row label="CSV Uploaded" val={bulkUploaded} />
                    <Row label="Generate Clicked" val={bulkGenClicked} />
                    <Row label="Limit Hit" val={bulkLimitHit} />
                    <Row label="Success" val={bulkSuccess} />
                    <Row label="ZIP Downloaded" val={bulkDownloaded} />
                    <div className="mt-2 text-xs text-gray-500">
                        Conversion: {bulkUploaded > 0 ? Math.round((bulkDownloaded / bulkUploaded) * 100) : 0}%
                    </div>
                </Card>

                {/* Orders Distribution */}
                <Card title="Order Size Dist (Bulk 7d)">
                    {Object.entries(dist).map(([k, v]) => (
                        <Row key={k} label={k} val={v} />
                    ))}
                </Card>

                {/* Limit Pressure */}
                <Card title="Limit Pressure (7d)">
                    <Row label="Limit Hit Events" val={bulkLimitHit} />
                </Card>

                {/* Landing Context */}
                <Card title="Bulk Landing Context (7d)">
                    {landingContextRaw.map(LC => (
                        <Row key={LC.landing_context} label={LC.landing_context} val={LC._count.landing_context} />
                    ))}
                </Card>

                {/* Footer Discovery */}
                <Card title="Footer Discovery (7d)">
                    <Row label="Total Clicks" val={footerClicks} />
                    <Row label="To Bulk" val={footerToBulk} />
                </Card>

            </div>
        </div>
    );
}

function Card({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="bg-white p-6 rounded shadow border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-blue-800">{title}</h2>
            <div className="space-y-2">{children}</div>
        </div>
    );
}

function Row({ label, val }: { label: string, val: number | string }) {
    return (
        <div className="flex justify-between border-b border-dashed border-gray-100 pb-1">
            <span>{label}</span>
            <span className="font-bold">{val}</span>
        </div>
    );
}

function Stat({ label, val7, val14 }: { label: string, val7: number, val14: number }) {
    return (
        <div className="flex justify-between border-b border-dashed border-gray-100 pb-1 items-center">
            <span>{label}</span>
            <div className="text-right">
                <span className="font-bold block">{val7} <span className="text-xs font-normal text-gray-400">7d</span></span>
                <span className="text-xs text-gray-500">{val14} <span className="text-[10px] text-gray-300">14d</span></span>
            </div>
        </div>
    );
}
