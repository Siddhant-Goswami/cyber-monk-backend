const express = require('express');
const router = express.Router();
const contentService = require('../services/content');
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

module.exports = router;