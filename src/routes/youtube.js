const express = require('express');
const router = express.Router();
const youtubeCrawler = require('../services/youtube-crawler');
const { sendError, validateRequired } = require('../utils/helpers');

// GET /youtube/status - Check YouTube crawler status
router.get('/status', (req, res) => {
  try {
    res.json({
      success: true,
      status: 'operational',
      service: 'YouTube Crawler',
      features: [
        'Channel crawling via RSS feeds',
        'Video content extraction',
        'Keyword analysis',
        'Trend detection',
        'Multi-channel support'
      ],
      supported_url_formats: [
        'https://youtube.com/@username',
        'https://youtube.com/channel/CHANNEL_ID',
        'https://youtube.com/user/USERNAME',
        'https://youtube.com/c/CHANNEL_NAME'
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    sendError(res, 500, 'Failed to check YouTube crawler status');
  }
});

// POST /youtube/crawl - Crawl a specific YouTube channel
router.post('/crawl', async (req, res) => {
  try {
    const { url, channelUrl } = req.body;
    const youtubeUrl = url || channelUrl;

    // Validate required fields
    if (!youtubeUrl) {
      return sendError(res, 400, 'Missing required field: url or channelUrl');
    }

    // Validate YouTube URL format
    if (!youtubeUrl.includes('youtube.com')) {
      return sendError(res, 400, 'Invalid YouTube URL format');
    }

    console.log(`🔍 Starting YouTube crawl for: ${youtubeUrl}`);

    // Crawl the YouTube channel
    const result = await youtubeCrawler.crawlYouTubeChannel(youtubeUrl);

    if (!result.success) {
      return sendError(res, 500, 'Failed to crawl YouTube channel');
    }

    // Extract trending keywords from crawled data
    const trendingKeywords = youtubeCrawler.extractTrendingKeywords(result.data);

    // Enhance response with additional analytics
    const enhancedResult = {
      ...result,
      analytics: {
        trending_keywords: trendingKeywords.slice(0, 10),
        total_keywords: trendingKeywords.length,
        video_count: result.data.videos.length,
        recent_activity: result.data.videos.slice(0, 3).map(v => ({
          title: v.title,
          published: v.publishedDate,
          keywords: v.keywords.slice(0, 5)
        }))
      }
    };

    res.status(200).json({
      success: true,
      message: 'YouTube channel crawled successfully',
      data: enhancedResult.data,
      analytics: enhancedResult.analytics,
      crawled_at: result.crawledAt
    });

  } catch (error) {
    console.error('YouTube crawl error:', error);
    sendError(res, 500, error.message || 'Failed to crawl YouTube channel');
  }
});

// GET /youtube/channels - List all crawled YouTube channels (mock for now)
router.get('/channels', (req, res) => {
  try {
    const mockChannels = [
      {
        id: 'UCoch_d78Aosmp14ey1HgGSQ',
        name: '100x Engineers',
        url: 'https://youtube.com/@100xengineers',
        subscribers: '50K+',
        videos: 125,
        last_crawled: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        trending_topics: ['AI', 'Programming', 'Startup']
      },
      {
        id: 'UCCjyq_K1Xwfg8Lndy7lKMpA',
        name: 'TechCrunch',
        url: 'https://youtube.com/@techcrunch',
        subscribers: '2.1M',
        videos: 8520,
        last_crawled: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        trending_topics: ['Funding', 'Innovation', 'Tech News']
      }
    ];

    res.json({
      success: true,
      channels: mockChannels,
      total_channels: mockChannels.length,
      active_channels: mockChannels.filter(c => c.status === 'active').length
    });

  } catch (error) {
    sendError(res, 500, 'Failed to retrieve YouTube channels');
  }
});

// POST /youtube/channels - Add a new YouTube channel to track
router.post('/channels', async (req, res) => {
  try {
    const { url, name, auto_crawl = false } = req.body;

    // Validate required fields
    const missing = validateRequired(req.body, ['url']);
    if (missing) {
      return sendError(res, 400, `Missing required fields: ${missing.join(', ')}`);
    }

    // Validate YouTube URL
    if (!url.includes('youtube.com')) {
      return sendError(res, 400, 'Invalid YouTube URL format');
    }

    // Extract channel info by crawling
    const crawlResult = await youtubeCrawler.crawlYouTubeChannel(url);
    
    if (!crawlResult.success) {
      return sendError(res, 400, 'Unable to access YouTube channel. Please check the URL.');
    }

    // Create channel record
    const channelRecord = {
      id: crawlResult.data.channelId,
      name: name || crawlResult.data.channelName,
      url: url,
      channel_name: crawlResult.data.channelName,
      description: crawlResult.data.channelDescription,
      video_count: crawlResult.data.totalVideos,
      auto_crawl: auto_crawl,
      status: 'active',
      added_at: new Date().toISOString(),
      last_crawled: crawlResult.crawledAt,
      latest_videos: crawlResult.data.videos.slice(0, 5).map(v => ({
        id: v.id,
        title: v.title,
        published: v.publishedDate
      }))
    };

    res.status(201).json({
      success: true,
      message: 'YouTube channel added successfully',
      channel: channelRecord,
      initial_crawl: {
        videos_found: crawlResult.data.totalVideos,
        trending_keywords: youtubeCrawler.extractTrendingKeywords(crawlResult.data).slice(0, 5)
      }
    });

  } catch (error) {
    console.error('Add YouTube channel error:', error);
    sendError(res, 500, error.message || 'Failed to add YouTube channel');
  }
});

// GET /youtube/trends - Get trending topics from YouTube content
router.get('/trends', async (req, res) => {
  try {
    const { refresh = 'false', channel_id } = req.query;
    
    // Mock trending data for demonstration
    const mockTrends = [
      {
        keyword: 'AI Generated Content',
        growth: '+245%',
        mentions: 47,
        category: 'Technology',
        volume: 125000,
        sentiment: 'positive',
        velocity: 'accelerating',
        source_channels: ['100x Engineers', 'TechCrunch'],
        updated_at: new Date().toISOString()
      },
      {
        keyword: 'Startup Funding',
        growth: '+180%',
        mentions: 32,
        category: 'Business',
        volume: 89000,
        sentiment: 'positive',
        velocity: 'steady',
        source_channels: ['TechCrunch', 'Y Combinator'],
        updated_at: new Date().toISOString()
      },
      {
        keyword: 'React Development',
        growth: '+95%',
        mentions: 28,
        category: 'Technology',
        volume: 67000,
        sentiment: 'neutral',
        velocity: 'steady',
        source_channels: ['100x Engineers'],
        updated_at: new Date().toISOString()
      }
    ];

    // If specific channel requested, filter trends
    let filteredTrends = mockTrends;
    if (channel_id) {
      const channelNames = {
        'UCoch_d78Aosmp14ey1HgGSQ': '100x Engineers',
        'UCCjyq_K1Xwfg8Lndy7lKMpA': 'TechCrunch'
      };
      const channelName = channelNames[channel_id];
      if (channelName) {
        filteredTrends = mockTrends.filter(trend => 
          trend.source_channels.includes(channelName)
        );
      }
    }

    res.json({
      success: true,
      trends: filteredTrends,
      trends_count: filteredTrends.length,
      analysis_summary: {
        channels_analyzed: channel_id ? 1 : 2,
        total_keywords_extracted: 156,
        last_updated: new Date().toISOString(),
        refresh_requested: refresh === 'true',
        data_source: 'youtube_crawler'
      }
    });

  } catch (error) {
    console.error('YouTube trends error:', error);
    sendError(res, 500, 'Failed to retrieve YouTube trends');
  }
});

// POST /youtube/analyze - Analyze content from multiple YouTube channels
router.post('/analyze', async (req, res) => {
  try {
    const { channels = [], keywords = [], timeframe = '7d' } = req.body;

    if (channels.length === 0) {
      return sendError(res, 400, 'At least one YouTube channel URL is required');
    }

    console.log(`🔍 Analyzing ${channels.length} YouTube channels for insights`);

    const analysisResults = [];
    const allTrends = [];

    // Crawl each channel
    for (const channelUrl of channels) {
      try {
        const crawlResult = await youtubeCrawler.crawlYouTubeChannel(channelUrl);
        
        if (crawlResult.success) {
          const channelTrends = youtubeCrawler.extractTrendingKeywords(crawlResult.data);
          allTrends.push(channelTrends);

          analysisResults.push({
            channel_url: channelUrl,
            channel_name: crawlResult.data.channelName,
            videos_analyzed: crawlResult.data.totalVideos,
            trending_keywords: channelTrends.slice(0, 10),
            success: true
          });
        } else {
          analysisResults.push({
            channel_url: channelUrl,
            success: false,
            error: 'Failed to crawl channel'
          });
        }
      } catch (error) {
        analysisResults.push({
          channel_url: channelUrl,
          success: false,
          error: error.message
        });
      }
    }

    // Combine trends from all channels
    const combinedTrends = youtubeCrawler.combineTrends(allTrends);

    // Filter by keywords if specified
    let filteredTrends = combinedTrends;
    if (keywords.length > 0) {
      filteredTrends = combinedTrends.filter(trend =>
        keywords.some(keyword => 
          trend.keyword.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }

    res.json({
      success: true,
      analysis: {
        channels_processed: analysisResults.filter(r => r.success).length,
        channels_failed: analysisResults.filter(r => !r.success).length,
        total_trends_found: combinedTrends.length,
        filtered_trends: filteredTrends.length,
        timeframe: timeframe
      },
      channel_results: analysisResults,
      combined_trends: filteredTrends.slice(0, 20),
      analyzed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('YouTube analysis error:', error);
    sendError(res, 500, error.message || 'Failed to analyze YouTube channels');
  }
});

module.exports = router;