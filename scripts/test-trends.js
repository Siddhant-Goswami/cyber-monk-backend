// Simple trends service test script (no HTTP server binding)
const { getTrends, refreshTrends } = require('../src/services/trends-service');

(async () => {
  try {
    console.log('Running trends service tests...');

    const fresh = await getTrends({ sourceBased: false, forceRefresh: true });
    console.log('GET(force) shape:', Object.keys(fresh));
    console.log('trends_count:', fresh.trends_count, 'first:', fresh.trends?.[0]);

    const cached = await getTrends({ sourceBased: false, forceRefresh: false });
    console.log('GET(cached) shape:', Object.keys(cached));
    console.log('trends_count:', cached.trends_count);

    const sourceOnly = await refreshTrends({ sourceBased: true });
    console.log('POST(refresh, source_only) shape:', Object.keys(sourceOnly));
    console.log('trends_count:', sourceOnly.trends_count);

    // Basic shape checks
    const hasShape = (r) => r && r.trends && Number.isInteger(r.trends_count) && r.analysis_summary;
    if (!hasShape(fresh) || !hasShape(cached) || !hasShape(sourceOnly)) {
      console.error('Shape validation failed');
      process.exit(1);
    }

    console.log('✅ Trends service tests passed');
  } catch (err) {
    console.error('❌ Trends service test failed:', err);
    process.exit(1);
  }
})();

