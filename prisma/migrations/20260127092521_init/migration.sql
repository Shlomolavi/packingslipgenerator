-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ts" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event_name" TEXT NOT NULL,
    "tool_mode" TEXT NOT NULL,
    "landing_context" TEXT NOT NULL,
    "properties" TEXT NOT NULL
);
