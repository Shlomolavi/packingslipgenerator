"use server";

import { PrismaClient } from "@prisma/client";

// Global Prisma definition to prevent multiple instances in dev
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function logEvent(
    eventName: string,
    payload: {
        tool_mode: "single" | "bulk" | "unknown";
        landing_context?: string;
        [key: string]: any;
    }
) {
    try {
        const { tool_mode, landing_context, ...rest } = payload;

        await prisma.event.create({
            data: {
                event_name: eventName,
                tool_mode: tool_mode,
                landing_context: landing_context || "unknown",
                properties: JSON.stringify(rest),
            },
        });
    } catch (error) {
        // Analytics must be fail-safe. Do not crash the app.
        console.error("Failed to log event:", error);
    }
}
