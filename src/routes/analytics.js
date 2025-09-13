const express = require('express');
const router = express.Router();
const analyticsData = require('../data/analytics');
const trendsService = require('../services/trends-service');
const youtubeCrawler = require('../services/youtube-crawler');
const { sendError } = require('../utils/helpers');

// GET /analytics/topics - Retrieve topic performance analytics
router.get('/topics', (req, res) => {
  try {
    const { timeRange, status } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    
    const topicsData = analyticsData.getTopics(filters);
    res.json(topicsData);
  } catch (error) {
    sendError(res, 500, 'Failed to retrieve topic analytics');
  }
});

// GET /analytics/trends - Retrieve trend analysis data (cached, unified)
router.get('/trends', async (req, res) => {
  try {
    const refresh = String(req.query.refresh).toLowerCase() === 'true';
    const sourceBased = String(req.query.source_based).toLowerCase() === 'true';

    const result = await trendsService.getTrends({
      sourceBased,
      forceRefresh: refresh,
      backgroundIfStale: true,
    });

    res.json(result);
  } catch (error) {
    console.error('GET /trends error:', error);
    sendError(res, 500, 'Failed to retrieve trend data');
  }
});

// GET /analytics/efficiency - Retrieve efficiency metrics
router.get('/efficiency', (req, res) => {
  try {
    const efficiency = analyticsData.getEfficiencyMetrics();
    res.json(efficiency);
  } catch (error) {
    sendError(res, 500, 'Failed to retrieve efficiency metrics');
  }
});

// POST /analytics/refresh-trends - Refresh and update trending topics
router.post('/refresh-trends', async (req, res) => {
  try {
    const sourceBased = String(req.query.source_based).toLowerCase() === 'true';
    const result = await trendsService.refreshTrends({ sourceBased });
    res.status(200).json(result);
  } catch (error) {
    console.error('Trends refresh error:', error);
    sendError(res, 500, 'Failed to refresh trends data');
  }
});

// GET /analytics/youtube-insights - Get analytics insights from YouTube data
router.get('/youtube-insights', async (req, res) => {
  try {
    const { channel_urls, timeframe = '7d' } = req.query;
    
    if (!channel_urls) {
      return sendError(res, 400, 'Missing required parameter: channel_urls');
    }

    const urls = Array.isArray(channel_urls) ? channel_urls : [channel_urls];
    const insights = {
      channels_analyzed: 0,
      total_videos_analyzed: 0,
      trending_keywords: [],
      content_categories: {},
      engagement_patterns: {},
      publishing_insights: {},
      analyzed_at: new Date().toISOString()
    };

    // Analyze each channel
    for (const url of urls) {
      try {
        const crawlResult = await youtubeCrawler.crawlYouTubeChannel(url, { maxVideos: 50 });
        
        if (crawlResult.success) {
          insights.channels_analyzed++;
          insights.total_videos_analyzed += crawlResult.data.videos.length;

          // Extract trending keywords
          const channelTrends = youtubeCrawler.extractTrendingKeywords(crawlResult.data);
          insights.trending_keywords.push(...channelTrends);

          // Analyze content categories
          crawlResult.data.videos.forEach(video => {
            video.keywords.forEach(keyword => {
              const category = youtubeCrawler.categorizeKeyword(keyword);
              insights.content_categories[category] = (insights.content_categories[category] || 0) + 1;
            });
          });

          // Analyze publishing patterns
          const publishingTimes = crawlResult.data.videos.map(v => new Date(v.publishedDate));
          const daysOfWeek = publishingTimes.map(d => d.getDay());
          const dayFrequency = {};
          daysOfWeek.forEach(day => {
            const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
            dayFrequency[dayName] = (dayFrequency[dayName] || 0) + 1;
          });
          
          insights.publishing_insights[crawlResult.data.channelName] = {
            total_videos: crawlResult.data.videos.length,
            avg_videos_per_week: Math.round(crawlResult.data.videos.length / 4),
            most_active_day: Object.keys(dayFrequency).reduce((a, b) => dayFrequency[a] > dayFrequency[b] ? a : b),
            day_frequency: dayFrequency
          };
        }
      } catch (error) {
        console.error(`Failed to analyze channel ${url}:`, error.message);
      }
    }

    // Combine and rank trending keywords
    const keywordCounts = {};
    insights.trending_keywords.forEach(trend => {
      keywordCounts[trend.keyword] = (keywordCounts[trend.keyword] || 0) + trend.mentions;
    });

    insights.trending_keywords = Object.entries(keywordCounts)
      .map(([keyword, mentions]) => ({ keyword, mentions }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 20);

    // Calculate engagement patterns
    insights.engagement_patterns = {
      high_performing_categories: Object.entries(insights.content_categories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([category, count]) => ({ category, video_count: count })),
      recommended_posting_times: insights.publishing_insights
    };

    res.json({
      success: true,
      insights: insights,
      summary: {
        channels_processed: insights.channels_analyzed,
        total_content_analyzed: insights.total_videos_analyzed,
        top_trends: insights.trending_keywords.slice(0, 5).map(t => t.keyword),
        dominant_categories: Object.entries(insights.content_categories)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([category]) => category)
      }
    });

  } catch (error) {
    console.error('YouTube insights error:', error);
    sendError(res, 500, error.message || 'Failed to generate YouTube insights');
  }
});

// GET /analytics/cross-platform - Compare trends across YouTube, Twitter, and other sources
router.get('/cross-platform', async (req, res) => {
  try {
    const { include_youtube = 'true', include_twitter = 'true' } = req.query;

    const crossPlatformData = {
      platforms: [],
      unified_trends: [],
      platform_comparison: {},
      analyzed_at: new Date().toISOString()
    };

    // Get existing trends data
    const existingTrends = await trendsService.getTrends({ sourceBased: false });
    
    if (include_twitter === 'true') {
      crossPlatformData.platforms.push({
        platform: 'twitter',
        trends_count: existingTrends.trends?.length || 0,
        last_updated: existingTrends.analysis_summary?.last_updated,
        data_source: 'twitter_api'
      });
    }

    // Mock YouTube trends integration
    if (include_youtube === 'true') {
      const mockYouTubeTrends = [
        { keyword: 'AI Development', platform: 'youtube', mentions: 45, growth: '+120%' },
        { keyword: 'React Tutorial', platform: 'youtube', mentions: 38, growth: '+95%' },
        { keyword: 'Startup Tips', platform: 'youtube', mentions: 29, growth: '+78%' }
      ];

      crossPlatformData.platforms.push({
        platform: 'youtube',
        trends_count: mockYouTubeTrends.length,
        last_updated: new Date().toISOString(),
        data_source: 'youtube_rss'
      });

      crossPlatformData.unified_trends.push(...mockYouTubeTrends);
    }

    // Combine trends from existing data
    if (existingTrends.trends) {
      const twitterTrends = existingTrends.trends.map(trend => ({
        ...trend,
        platform: 'twitter'
      }));
      crossPlatformData.unified_trends.push(...twitterTrends);
    }

    // Create platform comparison
    const platformGroups = crossPlatformData.unified_trends.reduce((acc, trend) => {
      if (!acc[trend.platform]) acc[trend.platform] = [];
      acc[trend.platform].push(trend);
      return acc;
    }, {});

    crossPlatformData.platform_comparison = Object.entries(platformGroups).map(([platform, trends]) => ({
      platform,
      trend_count: trends.length,
      avg_mentions: Math.round(trends.reduce((sum, t) => sum + (t.mentions || 0), 0) / trends.length) || 0,
      top_trend: trends[0]?.keyword || 'N/A'
    }));

    // Sort unified trends by mentions
    crossPlatformData.unified_trends.sort((a, b) => (b.mentions || 0) - (a.mentions || 0));

    res.json({
      success: true,
      cross_platform_data: crossPlatformData,
      summary: {
        total_platforms: crossPlatformData.platforms.length,
        total_trends: crossPlatformData.unified_trends.length,
        most_active_platform: crossPlatformData.platform_comparison.reduce((max, curr) => 
          curr.trend_count > max.trend_count ? curr : max, 
          crossPlatformData.platform_comparison[0] || { platform: 'none', trend_count: 0 }
        ).platform
      }
    });

  } catch (error) {
    console.error('Cross-platform analytics error:', error);
    sendError(res, 500, error.message || 'Failed to generate cross-platform analytics');
  }
});

module.exports = router;
