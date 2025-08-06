const express = require('express');
const router = express.Router();
const projectsData = require('../data/projects');
const { sendError, validateRequired } = require('../utils/helpers');

// GET /projects - Retrieve all projects
router.get('/', (req, res) => {
  try {
    const projects = projectsData.getAll();
    res.json({ projects });
  } catch (error) {
    sendError(res, 500, 'Failed to retrieve projects');
  }
});

// POST /projects - Create a new project
router.post('/', (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    // Validate required fields
    const missing = validateRequired(req.body, ['title']);
    if (missing) {
      return sendError(res, 400, `Missing required fields: ${missing.join(', ')}`);
    }

    // Create new project
    const newProject = projectsData.create({
      title,
      description,
      category
    });
    
    res.status(201).json(newProject);
    
  } catch (error) {
    sendError(res, 500, 'Failed to create project');
  }
});

// PUT /projects/:id - Update project details
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.totalViews;
    delete updates.engagement;

    const updatedProject = projectsData.update(id, updates);
    
    if (!updatedProject) {
      return sendError(res, 404, 'Project not found');
    }

    res.json(updatedProject);
    
  } catch (error) {
    sendError(res, 500, 'Failed to update project');
  }
});

// DELETE /projects/:id - Delete a project
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = projectsData.deleteById(id);
    
    if (!deleted) {
      return sendError(res, 404, 'Project not found');
    }

    res.status(204).send();
    
  } catch (error) {
    sendError(res, 500, 'Failed to delete project');
  }
});

module.exports = router;