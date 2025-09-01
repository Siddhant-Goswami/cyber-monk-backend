const express = require('express');
const router = express.Router();
const analyticsData = require('../data/analytics');
const trendsService = require('../services/trends-service');
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

module.exports = router;
