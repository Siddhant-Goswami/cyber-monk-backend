const express = require('express');
const router = express.Router();
const analyticsData = require('../data/analytics');
const twitterService = require('../services/twitter');
const { sendError, validateRequired } = require('../utils/helpers');

// GET /delivery/channels - Get delivery channels configuration
router.get('/channels', (req, res) => {
  try {
    const channels = analyticsData.getDeliveryChannels();
    res.json(channels);
  } catch (error) {
    sendError(res, 500, 'Failed to retrieve delivery channels');
  }
});

// POST /delivery/publish - Publish content to delivery channels
router.post('/publish', async (req, res) => {
  try {
    const { projectId, channels, content, scheduleDate, hashtags } = req.body;
    
    // Validate required fields
    const missing = validateRequired(req.body, ['projectId', 'channels']);
    if (missing) {
      return sendError(res, 400, `Missing required fields: ${missing.join(', ')}`);
    }

    const publishResults = [];

    // Process each channel
    for (const channel of channels) {
      let channelResult = {
        channel: channel,
        status: 'pending',
        error: null
      };

      try {
        if (channel.toLowerCase() === 'twitter') {
          // Handle Twitter publishing
          if (!content || !content.text) {
            throw new Error('Content text is required for Twitter publishing');
          }

          const tweetData = twitterService.formatContent({
            title: content.text || content.title,
            summary: content.summary,
            url: content.url,
            hashtags: hashtags
          });

          const twitterResult = await twitterService.postTweet(tweetData);
          
          channelResult = {
            channel: 'twitter',
            status: 'published',
            result: twitterResult,
            publishedAt: new Date().toISOString()
          };

        } else {
          // Mock other channels (YouTube, Blog)
          channelResult = {
            channel: channel,
            status: 'published',
            result: {
              id: `${channel}_${Date.now()}`,
              url: `https://${channel.toLowerCase()}.com/post/${Date.now()}`,
              success: true
            },
            publishedAt: new Date().toISOString()
          };
        }

      } catch (error) {
        channelResult = {
          channel: channel,
          status: 'failed',
          error: error.message,
          failedAt: new Date().toISOString()
        };
      }

      publishResults.push(channelResult);
    }

    // Overall publish response
    const publishResult = {
      id: Math.floor(Math.random() * 1000) + 1,
      projectId: parseInt(projectId),
      channels: channels,
      results: publishResults,
      status: publishResults.every(r => r.status === 'published') ? 'completed' : 
              publishResults.some(r => r.status === 'published') ? 'partial' : 'failed',
      scheduleDate: scheduleDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      summary: {
        total: publishResults.length,
        published: publishResults.filter(r => r.status === 'published').length,
        failed: publishResults.filter(r => r.status === 'failed').length
      }
    };
    
    res.status(201).json(publishResult);
    
  } catch (error) {
    console.error('Delivery publish error:', error);
    sendError(res, 500, 'Failed to publish content');
  }
});

module.exports = router;