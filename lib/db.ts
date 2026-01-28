import Database from 'better-sqlite3';
import path from 'path';

// Singleton for DB connection
let db: Database.Database | undefined;

export function getDb() {
    if (db) return db;

    const dbPath = path.join(process.cwd(), 'analytics.db');
    db = new Database(dbPath);

    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');

    // Initialize Schema
    db.exec(`
        CREATE TABLE IF NOT EXISTS events (
            id TEXT PRIMARY KEY,
            ts TEXT NOT NULL,
            event_name TEXT NOT NULL,
            tool_mode TEXT NOT NULL,
            landing_context TEXT NOT NULL,
            properties TEXT NOT NULL
        )
    `);

    return db;
}
