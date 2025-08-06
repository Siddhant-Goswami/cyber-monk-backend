const express = require('express');
const router = express.Router();
const analyticsData = require('../data/analytics');
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

// POST /delivery/publish - Publish content to delivery channels (mock)
router.post('/publish', (req, res) => {
  try {
    const { projectId, channels, scheduleDate } = req.body;
    
    // Validate required fields
    const missing = validateRequired(req.body, ['projectId', 'channels']);
    if (missing) {
      return sendError(res, 400, `Missing required fields: ${missing.join(', ')}`);
    }

    // Mock successful publish response
    const publishResult = {
      id: Math.floor(Math.random() * 1000) + 1,
      projectId: parseInt(projectId),
      channels: channels,
      status: 'scheduled',
      scheduleDate: scheduleDate || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json(publishResult);
    
  } catch (error) {
    sendError(res, 500, 'Failed to publish content');
  }
});

module.exports = router;