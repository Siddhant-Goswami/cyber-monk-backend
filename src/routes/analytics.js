const express = require('express');
const router = express.Router();
const analyticsData = require('../data/analytics');
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

// GET /analytics/trends - Retrieve trend analysis data
router.get('/trends', (req, res) => {
  try {
    const trends = analyticsData.getTrends();
    res.json(trends);
  } catch (error) {
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

module.exports = router;