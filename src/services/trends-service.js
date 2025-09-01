// Trends Service with in-memory cache, unified shape, and background refresh
const sourcesData = require('../data/sources');
const youtubeCrawler = require('./youtube-crawler');

// Cache entries keyed by variant (sourceBased: true/false)
// { data, updatedAt, summary, ttlMs }
const cache = {
  true: null,
  false: null,
};

const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

function isStale(entry, now = Date.now()) {
  if (!entry) return true;
  return now - entry.updatedAt > (entry.ttlMs || DEFAULT_TTL_MS);
}

function shapeResponse(trendsArray, meta) {
  const shapedTrends = (trendsArray || []).map(t => ({
    keyword: t.keyword,
    growth: t.growth,
    category: t.category,
    mentions: t.mentions,
  }));
  return {
    trends: shapedTrends,
    trends_count: shapedTrends.length,
    analysis_summary: {
      sources_analyzed: meta?.sourcesAnalyzed ?? 0,
      total_keywords_extracted: shapedTrends.length,
      last_updated: new Date(meta?.lastUpdated || Date.now()).toISOString(),
      ...(typeof meta?.realDataSources === 'number' ? { real_data_sources: meta.realDataSources } : {}),
    },
  };
}

async function crawlAndExtract({ sourceBased }) {
  const sources = sourcesData.getAll();
  const activeSources = sources.filter(s => s.status === 'active');

  const allTrends = [];
  const crawlResults = [];

  for (const source of activeSources) {
    try {
      if (source.type === 'YouTube' || (source.url && source.url.includes('youtube.com'))) {
        const crawlResult = await youtubeCrawler.crawlYouTubeChannel(source.url);
        if (crawlResult.success) {
          const trends = youtubeCrawler.extractTrendingKeywords(crawlResult.data);
          allTrends.push(...trends);
          crawlResults.push({
            source: source.name,
            type: source.type,
            status: 'success',
            isMockData: !!crawlResult.data.isMockData,
            videosFound: crawlResult.data.totalVideos,
            trendsExtracted: trends.length,
          });
          sourcesData.updateLastCrawled(source.id, new Date().toISOString());
        } else {
          crawlResults.push({ source: source.name, type: source.type, status: 'failed' });
        }
      } else if (!sourceBased) {
        // Non-sourceBased mode: allow simple fabricated trends for non-YouTube sources
        if (source.type === 'RSS') {
          const mockTrends = [
            { keyword: 'technology', mentions: 5, growth: '+45%', volume: 12000, category: 'Technology' },
            { keyword: 'innovation', mentions: 3, growth: '+62%', volume: 8500, category: 'Business' },
            { keyword: 'research', mentions: 4, growth: '+38%', volume: 9200, category: 'General' },
          ].map(trend => ({ ...trend, updated_at: new Date().toISOString(), sentiment: 'positive', velocity: 'steady' }));
          allTrends.push(...mockTrends);
          crawlResults.push({ source: source.name, type: source.type, status: 'success', isMockData: true, trendsExtracted: mockTrends.length });
          sourcesData.updateLastCrawled(source.id, new Date().toISOString());
        } else if (source.type === 'Twitter') {
          const mockTrends = [
            { keyword: 'ai', mentions: 8, growth: '+123%', volume: 25000, category: 'Technology' },
            { keyword: 'startup', mentions: 4, growth: '+89%', volume: 18000, category: 'Business' },
            { keyword: 'content', mentions: 6, growth: '+67%', volume: 15000, category: 'Content' },
          ].map(trend => ({ ...trend, updated_at: new Date().toISOString(), sentiment: 'positive', velocity: 'accelerating' }));
          allTrends.push(...mockTrends);
          crawlResults.push({ source: source.name, type: source.type, status: 'success', isMockData: true, trendsExtracted: mockTrends.length });
          sourcesData.updateLastCrawled(source.id, new Date().toISOString());
        }
      }
      // brief delay to avoid hammering
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      crawlResults.push({ source: source.name, type: source.type, status: 'failed', error: err?.message });
    }
  }

  // Combine trends
  const combined = youtubeCrawler.combineTrends([allTrends]);

  const successCount = crawlResults.filter(r => r.status === 'success').length;
  const realDataSources = crawlResults.filter(r => r.status === 'success' && !r.isMockData).length;

  return {
    trends: combined,
    meta: {
      sourcesAnalyzed: activeSources.length,
      lastUpdated: Date.now(),
      realDataSources,
      successCount,
      crawlResults,
    },
  };
}

async function refreshTrends({ sourceBased }) {
  const { trends, meta } = await crawlAndExtract({ sourceBased });
  const entry = {
    data: trends,
    updatedAt: meta.lastUpdated,
    summary: meta,
    ttlMs: DEFAULT_TTL_MS,
  };
  cache[String(!!sourceBased)] = entry;
  return shapeResponse(trends, {
    sourcesAnalyzed: meta.sourcesAnalyzed,
    totalKeywordsExtracted: trends.length,
    lastUpdated: meta.lastUpdated,
    realDataSources: meta.realDataSources,
  });
}

async function getTrends({ sourceBased, forceRefresh = false, backgroundIfStale = true }) {
  const key = String(!!sourceBased);
  const entry = cache[key];
  const stale = isStale(entry);

  if (forceRefresh || !entry) {
    // Do a foreground refresh and return the result
    return await refreshTrends({ sourceBased });
  }

  if (stale && backgroundIfStale) {
    // Kick off background refresh but return current cache
    refreshTrends({ sourceBased }).catch(err => console.error('Background trends refresh failed:', err));
  }

  return shapeResponse(entry.data, {
    sourcesAnalyzed: entry.summary?.sourcesAnalyzed,
    totalKeywordsExtracted: entry.data?.length || 0,
    lastUpdated: entry.updatedAt,
    realDataSources: entry.summary?.realDataSources,
  });
}

module.exports = {
  getTrends,
  refreshTrends,
};

