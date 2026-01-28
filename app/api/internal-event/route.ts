import { NextRequest, NextResponse } from "next/server";
import { logEvent } from "../../../lib/logger";

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
    "single_order_started"
]);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { event_name, ...payload } = body;

        if (!event_name || !ALLOWED_EVENTS.has(event_name)) {
            return NextResponse.json({ error: "Invalid or missing event_name" }, { status: 400 });
        }

        // Server-side logging to DB
        logEvent(event_name, payload);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[API/InternalEvent] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
