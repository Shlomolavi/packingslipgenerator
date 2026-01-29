import { NextRequest, NextResponse } from "next/server";
import { logEvent } from "../../../lib/logger";
import { KV_ENV_SCHEME } from "../../../lib/db";

const ALLOWED_EVENTS = new Set([
    "bulk_csv_uploaded",
    "single_order_generated",
    "footer_navigation_clicked",
    "bulk_generate_clicked",
    "bulk_generate_success",
    "zip_downloaded",
    "bulk_limit_hit",
    "upgrade_cta_viewed",
    "upgrade_cta_clicked",
    "single_order_started",
    "bulk_csv_upload_success",
    "single_pdf_generated",
    "manual_verification_event"
]);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // Backward compatibility: support 'event' or 'event_name'
        const event_name = body.event_name || body.event;
        const { event_name: _n, event: _e, ...payload } = body;

        if (!event_name || !ALLOWED_EVENTS.has(event_name)) {
            return NextResponse.json({ error: "Invalid or missing event_name" }, { status: 400 });
        }

        // Server-side logging to DB
        console.log(`[API/InternalEvent] Received: ${event_name}`, payload);
        await logEvent(event_name, payload);

        return NextResponse.json({ success: true, kv_env: KV_ENV_SCHEME });
    } catch (error) {
        console.error("[API/InternalEvent] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
