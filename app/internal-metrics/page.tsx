import { getDashboardMetrics, getDebugInfo } from "../../lib/metrics";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function InternalMetricsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // 1. Protection (MVP)
    const expectedToken = process.env.INTERNAL_METRICS_TOKEN;
    if (!expectedToken) {
        return notFound();
    }

    // Await params and headers (Next.js 15/16 requirement)
    const sp = await searchParams;
    const queryToken = typeof sp.token === 'string' ? sp.token : undefined;

    const headerList = await headers();
    const headerToken = headerList.get("x-internal-token");

    const token = queryToken || headerToken;

    if (token !== expectedToken) {
        return notFound();
    }

    // 2. Fetch Data
    const metrics = getDashboardMetrics();
    const debug = getDebugInfo();

    // 3. Render
    return (
        <div className="min-h-screen bg-gray-50 p-8 font-mono text-gray-800">
            <h1 className="text-3xl font-bold mb-8 border-b pb-4">Internal Metrics (MVP)</h1>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-8 text-sm">
                <h2 className="font-bold text-yellow-800 mb-2">Debug Info</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Row label="DB Path" val={debug.dbPath} />
                        <Row label="Total Events" val={debug.totalEvents} />

                        <div className="mt-4 pt-4 border-t border-yellow-200">
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Last Footer Event Props</h3>
                            <pre className="text-[10px] text-gray-600 bg-white p-2 rounded border border-yellow-100 overflow-x-auto">
                                {debug.lastFooterEvent ? JSON.stringify(JSON.parse((debug.lastFooterEvent as any).properties), null, 2) : 'None'}
                            </pre>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Recent Events (Last 10)</h3>
                        <div className="text-xs space-y-1 font-mono bg-white p-2 rounded border border-yellow-100 max-h-32 overflow-y-auto">
                            {debug.recentEvents.length === 0 && <span className="text-gray-400 italic">No events found.</span>}
                            {debug.recentEvents.map((e: any, i: number) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <span className="text-gray-400 w-16 shrink-0">{e.ts ? e.ts.split('T')[1].slice(0, 8) : 'N/A'}</span>
                                    <span className="font-bold text-blue-700 truncate">{e.event_name}</span>
                                    <span className="text-gray-500 text-[10px] hidden sm:inline">({e.tool_mode})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Usage Overview */}
                <Card title="Usage Overview">
                    <Stat label="Bulk Uploads (7d)" val={metrics.overview.bulkUploads.d7} />
                    <Stat label="Bulk Uploads (14d)" val={metrics.overview.bulkUploads.d14} />
                    <div className="border-t border-dashed my-2"></div>
                    <Stat label="Single Generated (7d)" val={metrics.overview.singleGenerated.d7} />
                    <Stat label="Single Generated (14d)" val={metrics.overview.singleGenerated.d14} />
                </Card>

                {/* Bulk Funnel (Uploads only for now) */}
                <Card title="Bulk Funnel (Uploads)">
                    <Stat label="Uploads (7d)" val={metrics.bulkFunnel.d7} />
                    <Stat label="Uploads (14d)" val={metrics.bulkFunnel.d14} />
                </Card>

                {/* Orders Distribution */}
                <Card title="Order Size Dist (Bulk 7d)">
                    {Object.entries(metrics.ordersDist).map(([k, v]) => (
                        <Row key={k} label={k} val={v} />
                    ))}
                </Card>

                {/* Footer Discovery */}
                <Card title="Footer Discovery (7d)">
                    <Row label="Footer -> Bulk (Mode)" val={metrics.footerToBulk.byMode} />
                    <Row label="Footer -> Bulk (Props)" val={metrics.footerToBulk.byProps} />
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

function Stat({ label, val }: { label: string, val: number }) {
    return (
        <div className="flex justify-between border-b border-dashed border-gray-100 pb-1 items-center">
            <span>{label}</span>
            <span className="font-bold">{val}</span>
        </div>
    );
}
