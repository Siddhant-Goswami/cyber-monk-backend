const express = require('express');
const router = express.Router();
const sourcesData = require('../data/sources');
const { sendError, validateRequired, isValidUrl, isValidSourceType, isValidStatus } = require('../utils/helpers');

// GET /sources - Retrieve all sources
router.get('/', (req, res) => {
  try {
    const sources = sourcesData.getAll();
    res.json({ sources });
  } catch (error) {
    sendError(res, 500, 'Failed to retrieve sources');
  }
});

// POST /sources - Add a new source
router.post('/', (req, res) => {
  try {
    const { url, type } = req.body;
    
    // Validate required fields
    const missing = validateRequired(req.body, ['url', 'type']);
    if (missing) {
      return sendError(res, 400, `Missing required fields: ${missing.join(', ')}`);
    }

    // Validate URL format
    if (!isValidUrl(url)) {
      return sendError(res, 400, 'Invalid URL format');
    }

    // Validate source type
    if (!isValidSourceType(type)) {
      return sendError(res, 400, 'Invalid source type. Must be one of: YouTube, RSS, Twitter, Blog');
    }

    // Create new source
    const newSource = sourcesData.create(req.body);
    res.status(201).json(newSource);
    
  } catch (error) {
    sendError(res, 500, 'Failed to create source');
  }
});

// PUT /sources/:id/status - Toggle source status
router.put('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate required fields
    if (!status) {
      return sendError(res, 400, 'Status is required');
    }

    // Validate status value
    if (!isValidStatus(status)) {
      return sendError(res, 400, 'Invalid status. Must be one of: active, paused, error');
    }

    const updatedSource = sourcesData.updateStatus(id, status);
    
    if (!updatedSource) {
      return sendError(res, 404, 'Source not found');
    }

    res.json(updatedSource);
    
  } catch (error) {
    sendError(res, 500, 'Failed to update source status');
  }
});

// DELETE /sources/:id - Remove a source
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = sourcesData.deleteById(id);
    
    if (!deleted) {
      return sendError(res, 404, 'Source not found');
    }

    res.status(204).send();
    
  } catch (error) {
    sendError(res, 500, 'Failed to delete source');
  }
});

module.exports = router;