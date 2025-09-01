const express = require('express');
const router = express.Router();
const twitterService = require('../services/twitter');

// Simple test endpoints
router.get('/status', async (req, res) => {
  try {
    const status = await twitterService.checkConnection();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/tweet', async (req, res) => {
  try {
    const { text, hashtags, url } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Format content for Twitter
    const tweetData = twitterService.formatContent({
      title: text,
      hashtags,
      url
    });

    // Post tweet
    const result = await twitterService.postTweet(tweetData);
    
    res.status(201).json({
      success: true,
      tweet: result,
      formatted_text: tweetData.text,
      metadata: tweetData.metadata
    });

  } catch (error) {
    console.error('Tweet posting error:', error);
    res.status(500).json({ error: error.message || 'Failed to post tweet' });
  }
});

// POST /twitter/thread - Post a Twitter thread
router.post('/thread', async (req, res) => {
  try {
    const { tweets, hashtags } = req.body;
    
    if (!Array.isArray(tweets) || tweets.length === 0) {
      return res.status(400).json({ error: 'Tweets must be a non-empty array' });
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
    res.status(500).json({ error: error.message || 'Failed to post thread' });
  }
});

module.exports = router;