const express = require('express');
const router = express.Router();
const twitterService = require('../services/twitter');
const { sendError, validateRequired } = require('../utils/helpers');

// GET /twitter/status - Check Twitter connection status
router.get('/status', async (req, res) => {
  try {
    const status = await twitterService.checkConnection();
    res.json(status);
  } catch (error) {
    sendError(res, 500, 'Failed to check Twitter connection status');
  }
});

// POST /twitter/debug - Debug endpoint to test formatting
router.post('/debug', (req, res) => {
  try {
    console.log('Debug endpoint hit!');
    console.log('Request body:', req.body);
    
    res.json({
      success: true,
      message: 'Debug endpoint working',
      body: req.body
    });

  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// POST /twitter/post - Post a single tweet  
router.post('/post', (req, res) => {
  res.json({ success: true, message: 'Post endpoint working', body: req.body });
});

// POST /twitter/tweet - Post a single tweet
router.post('/tweet', (req, res) => {
  res.json({ success: true, message: 'Tweet endpoint working', body: req.body });
});

// POST /twitter/thread - Post a Twitter thread
router.post('/thread', async (req, res) => {
  try {
    const { tweets, hashtags } = req.body;
    
    // Validate required fields
    const missing = validateRequired(req.body, ['tweets']);
    if (missing) {
      return sendError(res, 400, `Missing required fields: ${missing.join(', ')}`);
    }

    if (!Array.isArray(tweets) || tweets.length === 0) {
      return sendError(res, 400, 'Tweets must be a non-empty array');
    }

    // Format tweets for thread
    const formattedTweets = tweets.map((tweet, index) => {
      let text = tweet;
      
      // Add thread numbering for threads longer than 2 tweets
      if (tweets.length > 2) {
        text = `${index + 1}/${tweets.length} ${text}`;
      }
      
      // Add hashtags to last tweet in thread
      if (index === tweets.length - 1 && hashtags && Array.isArray(hashtags)) {
        const hashtagText = hashtags.map(tag => `#${tag}`).join(' ');
        text += `\n\n${hashtagText}`;
      }
      
      return text;
    });

    // Post thread
    const result = await twitterService.postThread(formattedTweets);
    
    res.status(201).json({
      success: true,
      thread: result,
      total_tweets: result.total_tweets
    });

  } catch (error) {
    console.error('Thread posting error:', error);
    sendError(res, 500, error.message || 'Failed to post thread');
  }
});

// POST /twitter/publish - Publish project content to Twitter
router.post('/publish', async (req, res) => {
  try {
    const { projectId, content, type = 'tweet', hashtags } = req.body;
    
    // Validate required fields
    const missing = validateRequired(req.body, ['projectId', 'content']);
    if (missing) {
      return sendError(res, 400, `Missing required fields: ${missing.join(', ')}`);
    }

    let result;

    if (type === 'thread' && Array.isArray(content)) {
      // Post as thread
      result = await twitterService.postThread(content.map(item => 
        typeof item === 'string' ? item : item.text || item.title || ''
      ));
    } else {
      // Post as single tweet
      const tweetContent = typeof content === 'string' ? content : 
                          content.text || content.title || content.summary || '';
      
      const tweetData = twitterService.formatContent({
        title: tweetContent,
        hashtags,
        url: content.url
      });

      result = await twitterService.postTweet(tweetData);
    }

    // Mock project association
    const publishRecord = {
      id: Math.floor(Math.random() * 1000) + 1,
      projectId: parseInt(projectId),
      platform: 'twitter',
      type: type,
      status: 'published',
      result: result,
      publishedAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      publish: publishRecord,
      twitter_result: result
    });

  } catch (error) {
    console.error('Twitter publish error:', error);
    sendError(res, 500, error.message || 'Failed to publish to Twitter');
  }
});

module.exports = router;