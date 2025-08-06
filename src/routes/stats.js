const express = require('express');
const router = express.Router();
const analyticsData = require('../data/analytics');
const { sendError } = require('../utils/helpers');

// GET /stats/usage - Retrieve usage statistics
router.get('/usage', (req, res) => {
  try {
    const stats = analyticsData.getUsageStats();
    res.json(stats);
  } catch (error) {
    sendError(res, 500, 'Failed to retrieve usage statistics');
  }
});

module.exports = router;