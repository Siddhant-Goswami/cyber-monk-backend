const express = require('express');
const router = express.Router();
const sourcesData = require('../data/sources');
const youtubeCrawler = require('../services/youtube-crawler');
const { sendError, validateRequired, isValidUrl, isValidSourceType, isValidStatus } = require('../utils/helpers');

// GET /sources - Retrieve all sources
router.get('/', (req, res) => {
  try {
    const sources = sourcesData.getAll();
    res.json({ sources });
  } catch (error) {
    sendError(res, 500, 'Failed to retrieve sources');
  }
});

// POST /sources - Add a new source
router.post('/', (req, res) => {
  try {
    const { url, type } = req.body;
    
    // Validate required fields
    const missing = validateRequired(req.body, ['url', 'type']);
    if (missing) {
      return sendError(res, 400, `Missing required fields: ${missing.join(', ')}`);
    }

    // Validate URL format
    if (!isValidUrl(url)) {
      return sendError(res, 400, 'Invalid URL format');
    }

    // Validate source type
    if (!isValidSourceType(type)) {
      return sendError(res, 400, 'Invalid source type. Must be one of: YouTube, RSS, Twitter, Blog');
    }

    // Create new source
    const newSource = sourcesData.create(req.body);
    res.status(201).json(newSource);
    
  } catch (error) {
    sendError(res, 500, 'Failed to create source');
  }
});

// PUT /sources/:id/status - Toggle source status
router.put('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate required fields
    if (!status) {
      return sendError(res, 400, 'Status is required');
    }

    // Validate status value
    if (!isValidStatus(status)) {
      return sendError(res, 400, 'Invalid status. Must be one of: active, paused, error');
    }

    const updatedSource = sourcesData.updateStatus(id, status);
    
    if (!updatedSource) {
      return sendError(res, 404, 'Source not found');
    }

    res.json(updatedSource);
    
  } catch (error) {
    sendError(res, 500, 'Failed to update source status');
  }
});

// DELETE /sources/:id - Remove a source
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = sourcesData.deleteById(id);
    
    if (!deleted) {
      return sendError(res, 404, 'Source not found');
    }

    res.status(204).send();
    
  } catch (error) {
    sendError(res, 500, 'Failed to delete source');
  }
});

// POST /sources/:id/crawl - Crawl a specific source
router.post('/:id/crawl', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get source by ID
    const source = sourcesData.getById(id);
    if (!source) {
      return sendError(res, 404, 'Source not found');
    }

    console.log(`🚀 Starting crawl for source: ${source.name} (${source.type})`);
    console.log(`🔗 URL: ${source.url}`);

    let crawlResult;

    // Handle different source types
    if (source.type === 'YouTube' || source.url.includes('youtube.com')) {
      crawlResult = await youtubeCrawler.crawlYouTubeChannel(source.url);
      
      if (crawlResult.success) {
        // Update source with crawled information
        sourcesData.updateLastCrawled(id, new Date().toISOString());
        
        // Update source name if it was generic
        if (source.name === 'Unnamed Source' || source.name === 'YouTube Channel') {
          sourcesData.updateName(id, crawlResult.data.channelName);
        }

        // Extract trends from crawled data
        const trends = youtubeCrawler.extractTrendingKeywords(crawlResult.data);
        
        console.log(`✅ Successfully crawled ${crawlResult.data.channelName}`);
        console.log(`📊 Found ${crawlResult.data.totalVideos} videos, ${trends.length} trending keywords`);

        res.json({
          success: true,
          message: `Successfully crawled ${crawlResult.data.channelName}`,
          data: {
            sourceId: parseInt(id),
            channelName: crawlResult.data.channelName,
            videosFound: crawlResult.data.totalVideos,
            trends: trends.slice(0, 10), // Top 10 trends
            lastCrawled: crawlResult.crawledAt,
            videos: crawlResult.data.videos.slice(0, 5), // Latest 5 videos
            isMockData: crawlResult.data.isMockData || false
          }
        });
      } else {
        console.error(`❌ Crawl failed for ${source.name}:`, crawlResult.error);
        res.status(500).json({
          success: false,
          error: crawlResult.error || 'Failed to crawl YouTube channel'
        });
      }

    } else if (source.type === 'RSS') {
      // Mock RSS crawling for demonstration
      console.log('📰 Processing RSS feed...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing

      res.json({
        success: true,
        message: `Successfully crawled RSS feed`,
        data: {
          sourceId: parseInt(id),
          feedName: source.name,
          articlesFound: Math.floor(Math.random() * 20) + 5,
          trends: [
            { keyword: 'technology', mentions: 5, growth: '+45%', category: 'Technology' },
            { keyword: 'innovation', mentions: 3, growth: '+62%', category: 'Business' }
          ],
          lastCrawled: new Date().toISOString(),
          isMockData: true
        }
      });

    } else if (source.type === 'Twitter') {
      // Mock Twitter crawling for demonstration
      console.log('🐦 Processing Twitter feed...');
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate processing

      res.json({
        success: true,
        message: `Successfully crawled Twitter feed`,
        data: {
          sourceId: parseInt(id),
          accountName: source.name,
          tweetsFound: Math.floor(Math.random() * 50) + 10,
          trends: [
            { keyword: 'ai', mentions: 8, growth: '+123%', category: 'Technology' },
            { keyword: 'startup', mentions: 4, growth: '+89%', category: 'Business' }
          ],
          lastCrawled: new Date().toISOString(),
          isMockData: true
        }
      });

    } else {
      res.status(400).json({
        success: false,
        error: `Crawling not supported for source type: ${source.type}`
      });
    }

  } catch (error) {
    console.error('Source crawling error:', error);
    sendError(res, 500, 'Failed to crawl source');
  }
});

// POST /sources/crawl-all - Crawl all active sources
router.post('/crawl-all', async (req, res) => {
  try {
    console.log('🚀 Starting crawl for all active sources...');
    
    const sources = sourcesData.getAll();
    const activeSources = sources.filter(source => source.status === 'active');
    
    console.log(`📊 Found ${activeSources.length} active sources to crawl`);

    const results = [];
    const allTrends = [];

    // Crawl each active source
    for (const source of activeSources) {
      try {
        console.log(`🔍 Crawling: ${source.name} (${source.type})`);
        
        let crawlResult;
        
        if (source.type === 'YouTube' || source.url.includes('youtube.com')) {
          crawlResult = await youtubeCrawler.crawlYouTubeChannel(source.url);
          
          if (crawlResult.success) {
            const trends = youtubeCrawler.extractTrendingKeywords(crawlResult.data);
            allTrends.push(...trends);
            
            results.push({
              sourceId: source.id,
              sourceName: crawlResult.data.channelName,
              type: source.type,
              status: 'success',
              videosFound: crawlResult.data.totalVideos,
              trendsExtracted: trends.length
            });
            
            // Update last crawled time
            sourcesData.updateLastCrawled(source.id, new Date().toISOString());
          } else {
            results.push({
              sourceId: source.id,
              sourceName: source.name,
              type: source.type,
              status: 'failed',
              error: crawlResult.error
            });
          }
        } else {
          // Mock crawling for other types
          results.push({
            sourceId: source.id,
            sourceName: source.name,
            type: source.type,
            status: 'success',
            itemsFound: Math.floor(Math.random() * 20) + 5,
            trendsExtracted: Math.floor(Math.random() * 5) + 2
          });
          
          sourcesData.updateLastCrawled(source.id, new Date().toISOString());
        }

        // Small delay between sources
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`❌ Error crawling ${source.name}:`, error.message);
        results.push({
          sourceId: source.id,
          sourceName: source.name,
          type: source.type,
          status: 'failed',
          error: error.message
        });
      }
    }

    // Combine trends from all sources
    const combinedTrends = youtubeCrawler.combineTrends([allTrends]);
    
    const successCount = results.filter(r => r.status === 'success').length;
    const failureCount = results.filter(r => r.status === 'failed').length;

    console.log(`✅ Crawl complete: ${successCount} succeeded, ${failureCount} failed`);
    console.log(`📈 Extracted ${combinedTrends.length} unique trending keywords`);

    res.json({
      success: true,
      message: `Crawled ${activeSources.length} sources: ${successCount} succeeded, ${failureCount} failed`,
      summary: {
        total_sources: activeSources.length,
        successful_crawls: successCount,
        failed_crawls: failureCount,
        total_trends_extracted: combinedTrends.length,
        completed_at: new Date().toISOString()
      },
      results: results,
      trending_keywords: combinedTrends.slice(0, 15) // Top 15 trends
    });
    
  } catch (error) {
    console.error('Batch crawling error:', error);
    sendError(res, 500, 'Failed to crawl sources');
  }
});

module.exports = router;