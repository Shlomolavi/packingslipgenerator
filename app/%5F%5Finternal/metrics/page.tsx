import { getDashboardMetrics } from "../../../lib/metrics";
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
        // If not configured, deny all by default for safety
        return notFound();
    }

    const sp = await searchParams;
    const queryToken = sp.token;
    const headerToken = (await headers()).get("x-internal-token");

    if (queryToken !== expectedToken && headerToken !== expectedToken) {
        return notFound();
    }

    // 2. Fetch Data
    const metrics = getDashboardMetrics();

    // 3. Render
    return (
        <div className="min-h-screen bg-gray-50 p-8 font-mono text-gray-800">
            <h1 className="text-3xl font-bold mb-8 border-b pb-4">Internal Metrics (MVP)</h1>

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
                    <Row label="Footer -> Bulk Clicks" val={metrics.footerToBulk.d7} />
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
