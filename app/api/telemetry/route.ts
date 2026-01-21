import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const event = {
            timestamp: new Date().toISOString(),
            ...body,
        };

        // Log to server console (captured by Vercel logs)
        console.info('[TELEMETRY]', JSON.stringify(event));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Telemetry error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
