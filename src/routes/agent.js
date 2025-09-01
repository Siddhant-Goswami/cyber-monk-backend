const express = require('express');
const router = express.Router();

// In-memory storage for agent data
const agentWorkflows = new Map();
const postedTweets = new Map();
const engagementMetrics = new Map();

// POST /api/agent/workflows - Receive workflow start notifications
router.post('/workflows', (req, res) => {
  try {
    const { workflowId, trigger, topics, timestamp } = req.body;
    
    if (!workflowId || !trigger || !topics || !timestamp) {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Missing required fields: workflowId, trigger, topics, timestamp'
        }
      });
    }

    if (!Array.isArray(topics) || topics.some(t => typeof t !== 'string')) {
      return res.status(400).json({
        error: { code: 'INVALID_REQUEST', message: 'Field "topics" must be an array of strings' }
      });
    }
    const ts = new Date(timestamp);
    if (Number.isNaN(ts.getTime())) {
      return res.status(400).json({
        error: { code: 'INVALID_REQUEST', message: 'Invalid timestamp' }
      });
    }

    // …rest of handler…
  } catch (err) {
    // …
  }
});
    const workflow = {
      id: workflowId,
      trigger,
      topics,
      timestamp,
      status: 'started',
      createdAt: new Date().toISOString()
    };

    agentWorkflows.set(workflowId, workflow);
    
    console.log(`[AGENT] Workflow ${workflowId} started:`, { trigger, topics: topics.length });
    
    res.status(200).json({ 
      received: true, 
      workflowId,
      message: 'Workflow start notification received'
    });
  } catch (error) {
    console.error('[AGENT] Error processing workflow start:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process workflow notification'
      }
    });
  }
});

// POST /api/agent/workflows/:id/status - Receive workflow status updates
router.post('/workflows/:id/status', (req, res) => {
  try {
    const { id: workflowId } = req.params;
    const { status, currentStep, metadata } = req.body;
    
    if (!workflowId || !status) {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Missing required fields: workflowId, status'
        }
      });
    }

    const workflow = agentWorkflows.get(workflowId);
    if (!workflow) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Workflow not found'
        }
      });
    }

    workflow.status = status;
    workflow.currentStep = currentStep;
    workflow.metadata = metadata;
    workflow.lastUpdated = new Date().toISOString();
    
    agentWorkflows.set(workflowId, workflow);
    
    console.log(`[AGENT] Workflow ${workflowId} status update:`, { status, currentStep });
    
    res.status(200).json({ 
      received: true, 
      workflowId,
      status,
      message: 'Workflow status updated'
    });
  } catch (error) {
    console.error('[AGENT] Error processing status update:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process status update'
      }
    });
  }
});

// POST /api/agent/tweets/posted - Receive tweet posting notifications
router.post('/tweets/posted', (req, res) => {
  try {
    const { workflowId, tweetId, tweetUrl, content, timestamp } = req.body;
    
    if (!workflowId || !tweetId || !content || !timestamp) {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Missing required fields: workflowId, tweetId, content, timestamp'
        }
      });
    }

    const tweetData = {
      workflowId,
      tweetId,
      tweetUrl,
      content,
      timestamp,
      receivedAt: new Date().toISOString()
    };

    postedTweets.set(tweetId, tweetData);
    
    // Update workflow status
    const workflow = agentWorkflows.get(workflowId);
    if (workflow) {
      workflow.status = 'posted';
      workflow.tweetId = tweetId;
      workflow.tweetUrl = tweetUrl;
      workflow.lastUpdated = new Date().toISOString();
      agentWorkflows.set(workflowId, workflow);
    }
    
    console.log(`[AGENT] Tweet posted:`, { workflowId, tweetId, contentLength: content.length });
    
    res.status(200).json({ 
      received: true, 
      tweetId,
      workflowId,
      message: 'Tweet posting notification received'
    });
  } catch (error) {
    console.error('[AGENT] Error processing tweet posted:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process tweet notification'
      }
    });
  }
});

// POST /api/agent/engagement - Receive engagement metrics
router.post('/engagement', (req, res) => {
  try {
    const { tweetId, metrics, timestamp } = req.body;
    
    if (!tweetId || !metrics || !timestamp) {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Missing required fields: tweetId, metrics, timestamp'
        }
      });
    }

    const engagementData = {
      tweetId,
      metrics: {
        likes: metrics.likes || 0,
        reposts: metrics.reposts || 0,
        replies: metrics.replies || 0,
        views: metrics.views || 0
      },
      timestamp,
      receivedAt: new Date().toISOString()
    };

    engagementMetrics.set(tweetId, engagementData);
    
    console.log(`[AGENT] Engagement metrics received:`, { 
      tweetId, 
      likes: metrics.likes, 
      reposts: metrics.reposts,
      replies: metrics.replies 
    });
    
    res.status(200).json({ 
      received: true, 
      tweetId,
      metrics: engagementData.metrics,
      message: 'Engagement metrics received'
    });
  } catch (error) {
    console.error('[AGENT] Error processing engagement metrics:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process engagement metrics'
      }
    });
  }
});

// GET /api/agent/status - Get agent integration status
router.get('/status', (req, res) => {
  try {
    const activeWorkflows = Array.from(agentWorkflows.values())
      .filter(w => ['started', 'researching', 'drafting', 'awaiting_approval'].includes(w.status));
    
    const completedWorkflows = Array.from(agentWorkflows.values())
      .filter(w => ['posted', 'approved'].includes(w.status));
    
    const totalTweets = postedTweets.size;
    const totalEngagementData = engagementMetrics.size;
    
    res.status(200).json({
      status: 'healthy',
      integration: {
        active_workflows: activeWorkflows.length,
        completed_workflows: completedWorkflows.length,
        total_tweets_tracked: totalTweets,
        engagement_metrics_collected: totalEngagementData
      },
      last_activity: Array.from(agentWorkflows.values())
        .sort((a, b) => new Date(b.lastUpdated || b.createdAt) - new Date(a.lastUpdated || a.createdAt))[0]?.lastUpdated || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[AGENT] Error getting status:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get agent status'
      }
    });
  }
});

// GET /api/agent/workflows - Get all workflows
router.get('/workflows', (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    
    let workflows = Array.from(agentWorkflows.values());
    
    if (status) {
      workflows = workflows.filter(w => w.status === status);
    }
    
    workflows = workflows
      .sort((a, b) => new Date(b.lastUpdated || b.createdAt) - new Date(a.lastUpdated || a.createdAt))
      .slice(0, parseInt(limit));
    
    res.status(200).json({
      workflows,
      total: workflows.length,
      filtered: !!status
    });
  } catch (error) {
    console.error('[AGENT] Error getting workflows:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get workflows'
      }
    });
  }
});

// GET /api/agent/engagement/report - Get engagement analytics
router.get('/engagement/report', (req, res) => {
  try {
    const { days = 7, tweetId } = req.query;
    
    let metrics = Array.from(engagementMetrics.values());
    
    if (tweetId) {
      metrics = metrics.filter(m => m.tweetId === tweetId);
    } else {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
      metrics = metrics.filter(m => new Date(m.timestamp) >= cutoffDate);
    }
    
    const totalLikes = metrics.reduce((sum, m) => sum + m.metrics.likes, 0);
    const totalReposts = metrics.reduce((sum, m) => sum + m.metrics.reposts, 0);
    const totalReplies = metrics.reduce((sum, m) => sum + m.metrics.replies, 0);
    const totalViews = metrics.reduce((sum, m) => sum + m.metrics.views, 0);
    
    res.status(200).json({
      report: {
        period_days: parseInt(days),
        tweets_tracked: metrics.length,
        total_engagement: {
          likes: totalLikes,
          reposts: totalReposts,
          replies: totalReplies,
          views: totalViews
        },
        average_per_tweet: metrics.length > 0 ? {
          likes: Math.round(totalLikes / metrics.length),
          reposts: Math.round(totalReposts / metrics.length),
          replies: Math.round(totalReplies / metrics.length),
          views: Math.round(totalViews / metrics.length)
        } : null,
        detailed_metrics: metrics
      },
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('[AGENT] Error generating engagement report:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to generate engagement report'
      }
    });
  }
});

module.exports = router;