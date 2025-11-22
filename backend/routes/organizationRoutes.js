const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const Project = require('../models/Project');
const authMiddleware = require('../middleware/authMiddleware');

// All routes protected with auth
router.use(authMiddleware);

// Validation helper
const validateOrganization = (data) => {
  const errors = [];
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Organization name is required');
  }
  if (data.name && data.name.length > 100) {
    errors.push('Organization name must be less than 100 characters');
  }
  return errors;
};

// @route   GET /api/organizations
// @desc    Get all organizations for current user
// @access  Private
router.get('/organizations', async (req, res) => {
  try {
    const organizations = await Organization.find({ userId: req.user.userId })
      .sort({ position: 1, createdAt: -1 });

    res.json({
      success: true,
      data: organizations,
      count: organizations.length
    });
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch organizations'
    });
  }
});

// @route   GET /api/organizations/:id
// @desc    Get single organization
// @access  Private
router.get('/organizations/:id', async (req, res) => {
  try {
    const organization = await Organization.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    res.json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error('Get organization error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        error: 'Invalid organization ID'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to fetch organization'
    });
  }
});

// @route   POST /api/organizations
// @desc    Create organization
// @access  Public
router.post('/organizations', async (req, res) => {
  try {
    const errors = validateOrganization(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: errors.join(', ')
      });
    }

    const organization = new Organization({
      userId: req.user.userId,
      name: req.body.name.trim(),
      description: req.body.description || '',
      color: req.body.color || '#6366f1',
      icon: req.body.icon || '🏢',
      position: req.body.position || 0
    });

    const savedOrganization = await organization.save();

    res.status(201).json({
      success: true,
      data: savedOrganization
    });
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create organization'
    });
  }
});

// @route   PUT /api/organizations/:id
// @desc    Update organization
// @access  Private
router.put('/organizations/:id', async (req, res) => {
  try {
    const organization = await Organization.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    const errors = validateOrganization(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: errors.join(', ')
      });
    }

    // Update fields
    if (req.body.name) organization.name = req.body.name.trim();
    if (req.body.description !== undefined) organization.description = req.body.description;
    if (req.body.color) organization.color = req.body.color;
    if (req.body.icon) organization.icon = req.body.icon;
    if (req.body.position !== undefined) organization.position = req.body.position;

    const updatedOrganization = await organization.save();

    res.json({
      success: true,
      data: updatedOrganization
    });
  } catch (error) {
    console.error('Update organization error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        error: 'Invalid organization ID'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to update organization'
    });
  }
});

// @route   DELETE /api/organizations/:id
// @desc    Delete organization
// @access  Private
router.delete('/organizations/:id', async (req, res) => {
  try {
    const organization = await Organization.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    // Check if organization has projects
    const projectCount = await Project.countDocuments({ organization: req.params.id });
    if (projectCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete organization with ${projectCount} project(s). Please move or delete projects first.`
      });
    }

    await Organization.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Organization deleted successfully'
    });
  } catch (error) {
    console.error('Delete organization error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        error: 'Invalid organization ID'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to delete organization'
    });
  }
});

module.exports = router;
