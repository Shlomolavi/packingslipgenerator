const Database = require('better-sqlite3');
const path = require('path');
const { randomUUID } = require('crypto');

console.log('--- Direct DB Test Start ---');
try {
    const dbPath = path.join(process.cwd(), 'analytics.db');
    console.log('Using DB Path:', dbPath);
    const db = new Database(dbPath);

    // Count before
    const countBefore = db.prepare('SELECT COUNT(*) as c FROM events').get().c;
    console.log('Count Before:', countBefore);

    // Insert
    const id = randomUUID();
    const ts = new Date().toISOString();
    const stmt = db.prepare(`
        INSERT INTO events (id, ts, event_name, tool_mode, landing_context, properties)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(id, ts, 'direct_test_event', 'test', 'script', JSON.stringify({ verified: true }));
    console.log('Insert Info:', info);

    // Count after
    const countAfter = db.prepare('SELECT COUNT(*) as c FROM events').get().c;
    console.log('Count After:', countAfter);

    if (countAfter > countBefore) {
        console.log('SUCCESS: Row inserted.');
    } else {
        console.error('FAILURE: Row count did not increase.');
    }

} catch (e) {
    console.error('CRITICAL ERROR:', e);
}
console.log('--- Direct DB Test End ---');
