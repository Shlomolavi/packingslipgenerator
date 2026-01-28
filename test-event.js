// Simulates calling the logger directly (as Server Actions would)
const { logEvent } = require('./lib/logger');
const { getDebugInfo } = require('./lib/metrics');

console.log('--- Debug Test Start ---');
try {
    const debugBefore = getDebugInfo();
    console.log('Events Before:', debugBefore.totalEvents);

    console.log('Logging test event...');
    logEvent('manual_debug_test', { tool_mode: 'test', note: 'Checking visibility' });

    const debugAfter = getDebugInfo();
    console.log('Events After:', debugAfter.totalEvents);

    if (debugAfter.totalEvents > debugBefore.totalEvents) {
        console.log('SUCCESS: Event count increased.');
        console.log('Recent Events:', debugAfter.recentEvents);
    } else {
        console.error('FAILURE: Event count did not increase.');
    }

} catch (e) {
    console.error('CRITICAL FAILURE:', e);
}
console.log('--- Debug Test End ---');
