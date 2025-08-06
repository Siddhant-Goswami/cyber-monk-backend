const express = require('express');
const router = express.Router();
const analyticsData = require('../data/analytics');
const { sendError } = require('../utils/helpers');

// GET /user/profile - Get user profile information
router.get('/profile', (req, res) => {
  try {
    const profile = analyticsData.getUserProfile();
    res.json(profile);
  } catch (error) {
    sendError(res, 500, 'Failed to retrieve user profile');
  }
});

// PUT /user/profile - Update user profile (mock)
router.put('/profile', (req, res) => {
  try {
    const updates = req.body;
    
    // Get current profile and merge updates
    const currentProfile = analyticsData.getUserProfile();
    const updatedProfile = { ...currentProfile, ...updates };
    
    // Remove fields that shouldn't be updated
    delete updatedProfile.id;
    delete updatedProfile.joinedAt;
    
    res.json(updatedProfile);
    
  } catch (error) {
    sendError(res, 500, 'Failed to update user profile');
  }
});

module.exports = router;