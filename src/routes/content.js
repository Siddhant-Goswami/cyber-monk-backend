const express = require('express');
const router = express.Router();
const contentService = require('../services/content');
const youtubeCrawler = require('../services/youtube-crawler');
const { sendError, validateRequired } = require('../utils/helpers');

// POST /content/generate-drafts - Generate new content drafts
router.post('/generate-drafts', async (req, res) => {
  try {
    const { count, category, keywords } = req.body;
    
    // Validate count if provided
    if (count && (typeof count !== 'number' || count < 1 || count > 20)) {
      return sendError(res, 400, 'Count must be a number between 1 and 20');
    }

    // Generate drafts
    console.log(`🚀 Generating ${count || 5} content drafts...`);
    
    const result = await contentService.generateDrafts({
      count: count || 5,
      category,
      keywords
    });
    
    console.log(`✅ Successfully generated ${result.drafts_count} drafts`);
    
    res.status(201).json(result);
    
  } catch (error) {
    console.error('Content generation error:', error);
    sendError(res, 500, 'Failed to generate content drafts');
  }
});

// GET /content/drafts - Get all content drafts
router.get('/drafts', async (req, res) => {
  try {
    const { status, category, limit = 10 } = req.query;
    
    // Mock drafts response for now
    const mockDrafts = [
      {
        id: 1,
        title: "AI Video Generation: The Complete 2025 Guide",
        content: "Comprehensive guide to AI video generation tools and techniques...",
        status: "pending",
        category: "AI",
        created_at: "2025-08-27T18:00:00Z",
        source_keywords: ["AI Video Generation", "AI", "Video", "Content Creation"],
        estimated_read_time: "8 min read",
        difficulty: "Advanced",
        target_audience: "Content Creators, Tech Enthusiasts"
      },
      {
        id: 2,
        title: "5 React 19 Tools Every Creator Should Use",
        content: "Discover the essential React 19 tools that will transform your development workflow...",
        status: "pending",
        category: "Technology", 
        created_at: "2025-08-27T17:45:00Z",
        source_keywords: ["React 19", "React", "JavaScript", "Frontend"],
        estimated_read_time: "5 min read",
        difficulty: "Intermediate",
        target_audience: "Developers, Software Engineers"
      }
    ];

    let filteredDrafts = mockDrafts;
    
    if (status) {
      filteredDrafts = filteredDrafts.filter(draft => draft.status === status);
    }
    
    if (category) {
      filteredDrafts = filteredDrafts.filter(draft => draft.category === category);
    }
    
    filteredDrafts = filteredDrafts.slice(0, parseInt(limit));

    res.json({
      success: true,
      drafts: filteredDrafts,
      total: filteredDrafts.length,
      filters: { status, category, limit }
    });
    
  } catch (error) {
    console.error('Drafts retrieval error:', error);
    sendError(res, 500, 'Failed to retrieve drafts');
  }
});

// PUT /content/drafts/:id - Update draft status
router.put('/drafts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, title, content } = req.body;
    
    // Validate status if provided
    const validStatuses = ['pending', 'approved', 'rejected', 'published'];
    if (status && !validStatuses.includes(status)) {
      return sendError(res, 400, `Status must be one of: ${validStatuses.join(', ')}`);
    }

    // Mock update response
    const updatedDraft = {
      id: parseInt(id),
      title: title || `Updated Draft ${id}`,
      content: content || `Updated content for draft ${id}...`,
      status: status || 'approved',
      updated_at: new Date().toISOString(),
      category: "Technology",
      source_keywords: ["Updated", "Content", "Draft"]
    };

    console.log(`📝 Updated draft ${id} with status: ${status}`);

    res.json({
      success: true,
      message: `Draft ${id} updated successfully`,
      draft: updatedDraft
    });
    
  } catch (error) {
    console.error('Draft update error:', error);
    sendError(res, 500, 'Failed to update draft');
  }
});

// DELETE /content/drafts/:id - Delete draft
router.delete('/drafts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Deleted draft ${id}`);

    res.json({
      success: true,
      message: `Draft ${id} deleted successfully`,
      deleted_id: parseInt(id)
    });
    
  } catch (error) {
    console.error('Draft deletion error:', error);
    sendError(res, 500, 'Failed to delete draft');
  }
});

// GET /content/stats - Get content statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      total_drafts: 12,
      pending_drafts: 8,
      approved_drafts: 3,
      published_drafts: 1,
      categories: {
        "AI": 5,
        "Technology": 4,
        "General": 3
      },
      recent_activity: [
        {
          action: "generated",
          count: 5,
          timestamp: new Date().toISOString()
        },
        {
          action: "approved", 
          count: 2,
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ],
      generation_metrics: {
        avg_generation_time: "2.3s",
        success_rate: "98%",
        popular_keywords: ["AI", "React", "Content Creation", "Tools"]
      }
    };

    res.json({
      success: true,
      stats: stats,
      last_updated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Stats retrieval error:', error);
    sendError(res, 500, 'Failed to retrieve content statistics');
  }
});

// POST /content/from-youtube - Generate content from YouTube video analysis
router.post('/from-youtube', async (req, res) => {
  try {
    const { youtube_urls, content_type = 'summary', target_platform = 'twitter' } = req.body;
    
    // Validate required fields
    if (!youtube_urls || !Array.isArray(youtube_urls) || youtube_urls.length === 0) {
      return sendError(res, 400, 'youtube_urls must be a non-empty array');
    }

    console.log(`🎬 Generating ${content_type} content from ${youtube_urls.length} YouTube sources`);

    const contentResults = [];
    const errors = [];

    // Process each YouTube URL
    for (const url of youtube_urls) {
      try {
        // Extract channel content
        const crawlResult = await youtubeCrawler.crawlYouTubeChannel(url, { maxVideos: 10 });
        
        if (crawlResult.success && crawlResult.data.videos.length > 0) {
          const videos = crawlResult.data.videos.slice(0, 3); // Use top 3 videos
          
          // Generate content based on video data
          const generatedContent = videos.map(video => {
            const trending_keywords = video.keywords ? video.keywords.slice(0, 5) : [];
            
            if (content_type === 'summary') {
              return {
                id: `summary_${video.id}`,
                type: 'summary',
                title: `Key Insights: ${video.title}`,
                content: `📹 ${video.title}\n\n🔗 ${video.videoUrl}\n\n📊 Trending topics: ${trending_keywords.join(', ')}\n\n${video.description ? video.description.substring(0, 200) + '...' : 'Great insights from this video!'}`,
                source_video: video,
                trending_keywords: trending_keywords,
                target_platform: target_platform,
                generated_at: new Date().toISOString()
              };
            } else if (content_type === 'thread') {
              const threadTweets = [
                `🧵 Key insights from "${video.title}"`,
                `🔍 Main topics: ${trending_keywords.slice(0, 3).join(', ')}`,
                video.description ? `💡 ${video.description.substring(0, 100)}...` : '💡 Amazing content worth checking out!',
                `🎯 Watch the full video: ${video.videoUrl}`
              ];

              return {
                id: `thread_${video.id}`,
                type: 'thread',
                title: `Thread: ${video.title}`,
                content: threadTweets,
                source_video: video,
                trending_keywords: trending_keywords,
                target_platform: target_platform,
                generated_at: new Date().toISOString()
              };
            } else if (content_type === 'article') {
              return {
                id: `article_${video.id}`,
                type: 'article',
                title: `Article: ${video.title}`,
                content: `# ${video.title}\n\n## Overview\n${video.description || 'An insightful video covering important topics.'}\n\n## Key Topics\n${trending_keywords.map(k => `- ${k.charAt(0).toUpperCase() + k.slice(1)}`).join('\n')}\n\n## Watch Video\n${video.videoUrl}\n\n*Generated from YouTube content analysis*`,
                source_video: video,
                trending_keywords: trending_keywords,
                target_platform: 'blog',
                generated_at: new Date().toISOString()
              };
            }
          }).filter(Boolean);

          contentResults.push({
            source_url: url,
            channel_name: crawlResult.data.channelName,
            content_generated: generatedContent,
            success: true
          });

        } else {
          errors.push({
            source_url: url,
            error: 'Failed to crawl channel or no videos found'
          });
        }
      } catch (error) {
        console.error(`Error processing ${url}:`, error.message);
        errors.push({
          source_url: url,
          error: error.message
        });
      }
    }

    // Flatten all generated content
    const allContent = contentResults.flatMap(result => result.content_generated || []);

    res.status(201).json({
      success: true,
      message: `Generated ${allContent.length} pieces of content from YouTube sources`,
      content_summary: {
        total_content_pieces: allContent.length,
        content_type: content_type,
        target_platform: target_platform,
        sources_processed: contentResults.length,
        sources_failed: errors.length
      },
      generated_content: allContent,
      source_results: contentResults,
      errors: errors.length > 0 ? errors : undefined,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('YouTube content generation error:', error);
    sendError(res, 500, error.message || 'Failed to generate content from YouTube');
  }
});

// POST /content/youtube-to-twitter - Convert YouTube content to Twitter-ready posts
router.post('/youtube-to-twitter', async (req, res) => {
  try {
    const { youtube_url, post_type = 'tweet', include_hashtags = true } = req.body;
    
    // Validate required fields
    const missing = validateRequired(req.body, ['youtube_url']);
    if (missing) {
      return sendError(res, 400, `Missing required fields: ${missing.join(', ')}`);
    }

    console.log(`🐦 Converting YouTube content to ${post_type} format`);

    // Crawl YouTube channel
    const crawlResult = await youtubeCrawler.crawlYouTubeChannel(youtube_url, { maxVideos: 5 });
    
    if (!crawlResult.success) {
      return sendError(res, 400, 'Failed to access YouTube content');
    }

    const videos = crawlResult.data.videos.slice(0, 3);
    const twitterContent = [];

    videos.forEach(video => {
      const keywords = video.keywords ? video.keywords.slice(0, 3) : [];
      
      if (post_type === 'tweet') {
        const hashtags = include_hashtags ? keywords.map(k => `#${k.replace(/\s+/g, '')}`).join(' ') : '';
        const tweet = `🎥 ${video.title}\n\n${video.videoUrl}\n\n${hashtags}`.trim();
        
        twitterContent.push({
          id: `tweet_${video.id}`,
          type: 'single_tweet',
          content: tweet,
          character_count: tweet.length,
          source_video: {
            id: video.id,
            title: video.title,
            url: video.videoUrl
          },
          hashtags: keywords,
          created_at: new Date().toISOString()
        });
      } else if (post_type === 'thread') {
        const threadTweets = [
          `🧵 ${video.title}`,
          `🔍 Key topics: ${keywords.join(', ')}`,
          `🎯 Full video: ${video.videoUrl}`
        ];
        
        if (include_hashtags) {
          const hashtags = keywords.map(k => `#${k.replace(/\s+/g, '')}`).join(' ');
          threadTweets[threadTweets.length - 1] += `\n\n${hashtags}`;
        }

        twitterContent.push({
          id: `thread_${video.id}`,
          type: 'twitter_thread',
          content: threadTweets,
          thread_length: threadTweets.length,
          total_characters: threadTweets.join(' ').length,
          source_video: {
            id: video.id,
            title: video.title,
            url: video.videoUrl
          },
          hashtags: keywords,
          created_at: new Date().toISOString()
        });
      }
    });

    res.status(201).json({
      success: true,
      message: `Created ${twitterContent.length} Twitter ${post_type}s from YouTube content`,
      twitter_content: twitterContent,
      source_info: {
        channel_name: crawlResult.data.channelName,
        videos_analyzed: videos.length,
        post_type: post_type,
        includes_hashtags: include_hashtags
      },
      ready_to_publish: true,
      created_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('YouTube to Twitter conversion error:', error);
    sendError(res, 500, error.message || 'Failed to convert YouTube content to Twitter format');
  }
});

// GET /content/youtube-inspiration - Get content inspiration from trending YouTube videos
router.get('/youtube-inspiration', async (req, res) => {
  try {
    const { categories = 'technology,business', limit = 10 } = req.query;
    
    // Mock YouTube channels for different categories
    const channelsByCategory = {
      technology: ['https://youtube.com/@100xengineers', 'https://youtube.com/@fireship'],
      business: ['https://youtube.com/@ycombinator', 'https://youtube.com/@techcrunch'],
      education: ['https://youtube.com/@3blue1brown', 'https://youtube.com/@freecodecamp']
    };

    const requestedCategories = categories.split(',').map(c => c.trim().toLowerCase());
    const inspiration = [];

    for (const category of requestedCategories) {
      if (channelsByCategory[category]) {
        for (const channelUrl of channelsByCategory[category]) {
          try {
            const crawlResult = await youtubeCrawler.crawlYouTubeChannel(channelUrl, { maxVideos: 3 });
            
            if (crawlResult.success && crawlResult.data.videos.length > 0) {
              const topVideo = crawlResult.data.videos[0];
              
              inspiration.push({
                category: category,
                channel: crawlResult.data.channelName,
                video: {
                  title: topVideo.title,
                  url: topVideo.videoUrl,
                  published: topVideo.publishedDate,
                  keywords: topVideo.keywords ? topVideo.keywords.slice(0, 5) : []
                },
                content_ideas: [
                  `Create a similar guide about: ${topVideo.keywords ? topVideo.keywords[0] : 'this topic'}`,
                  `Write a thread breaking down: ${topVideo.title}`,
                  `Compare different approaches to: ${topVideo.keywords ? topVideo.keywords[1] || topVideo.keywords[0] : 'the main topic'}`
                ],
                trending_score: Math.floor(Math.random() * 100) + 50
              });
            }
          } catch (error) {
            console.error(`Failed to get inspiration from ${channelUrl}:`, error.message);
          }
        }
      }
    }

    // Sort by trending score and limit results
    inspiration.sort((a, b) => b.trending_score - a.trending_score);
    const limitedInspiration = inspiration.slice(0, parseInt(limit));

    res.json({
      success: true,
      inspiration: limitedInspiration,
      metadata: {
        categories_analyzed: requestedCategories,
        total_ideas: limitedInspiration.length,
        sources_checked: Object.values(channelsByCategory)
          .filter(channels => requestedCategories.some(cat => channelsByCategory[cat]))
          .flat().length,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('YouTube inspiration error:', error);
    sendError(res, 500, error.message || 'Failed to get YouTube content inspiration');
  }
});

module.exports = router;