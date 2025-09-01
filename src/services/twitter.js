// Twitter API integration service
// This is a mock implementation for demonstration purposes
// In production, you would integrate with the actual Twitter API v2

class TwitterService {
  constructor() {
    this.isConnected = true; // Mock connection status
  }

  /**
   * Post a tweet to Twitter
   * @param {Object} tweetData - Tweet content and metadata
   * @returns {Promise<Object>} - Tweet response
   */
  async postTweet(tweetData) {
    try {
      // Validate tweet content
      if (!tweetData.text || tweetData.text.trim() === '') {
        throw new Error('Tweet text is required');
      }

      // Check character limit (280 characters for Twitter)
      if (tweetData.text.length > 280) {
        throw new Error('Tweet exceeds 280 character limit');
      }

      // Mock Twitter API call
      const mockResponse = {
        id: `tweet_${Date.now()}`,
        text: tweetData.text,
        author_id: 'user_123',
        created_at: new Date().toISOString(),
        public_metrics: {
          retweet_count: 0,
          like_count: 0,
          reply_count: 0,
          quote_count: 0
        },
        url: `https://twitter.com/user/status/tweet_${Date.now()}`,
        success: true
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log(`📱 Mock tweet posted: "${tweetData.text.substring(0, 50)}..."`);
      
      return mockResponse;

    } catch (error) {
      console.error('Twitter API Error:', error.message);
      throw error;
    }
  }

  /**
   * Post a thread (multiple tweets)
   * @param {Array} tweets - Array of tweet texts
   * @returns {Promise<Array>} - Array of tweet responses
   */
  async postThread(tweets) {
    try {
      if (!Array.isArray(tweets) || tweets.length === 0) {
        throw new Error('Thread must contain at least one tweet');
      }

      const results = [];
      let replyToId = null;

      for (const [index, tweetText] of tweets.entries()) {
        const tweetData = {
          text: tweetText,
          ...(replyToId && { in_reply_to_tweet_id: replyToId })
        };

        const result = await this.postTweet(tweetData);
        results.push({
          ...result,
          thread_position: index + 1,
          is_thread: true
        });

        replyToId = result.id;
        
        // Add delay between thread tweets
        if (index < tweets.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      return {
        success: true,
        thread_id: results[0].id,
        tweets: results,
        total_tweets: results.length
      };

    } catch (error) {
      console.error('Twitter Thread Error:', error.message);
      throw error;
    }
  }

  /**
   * Check connection status to Twitter API
   * @returns {Promise<Object>} - Connection status
   */
  async checkConnection() {
    try {
      // Mock connection check
      return {
        connected: this.isConnected,
        last_checked: new Date().toISOString(),
        api_version: 'v2',
        rate_limit: {
          remaining: 300,
          reset_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        }
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
        last_checked: new Date().toISOString()
      };
    }
  }

  /**
   * Format content for Twitter posting
   * @param {Object} content - Content to format
   * @returns {Object} - Formatted tweet data
   */
  formatContent(content) {
    let text = '';
    
    if (content.title) {
      text += `${content.title}\n\n`;
    }
    
    if (content.summary) {
      text += `${content.summary}\n\n`;
    }
    
    if (content.url) {
      text += `🔗 ${content.url}`;
    }
    
    if (content.hashtags && Array.isArray(content.hashtags)) {
      const hashtagText = content.hashtags.map(tag => `#${tag}`).join(' ');
      text += `\n\n${hashtagText}`;
    }

    // Truncate if too long
    if (text.length > 280) {
      text = text.substring(0, 277) + '...';
    }

    return {
      text: text.trim(),
      metadata: {
        original_length: text.length,
        truncated: text.length > 280,
        hashtags: content.hashtags || [],
        source_url: content.url
      }
    };
  }
}

module.exports = new TwitterService();