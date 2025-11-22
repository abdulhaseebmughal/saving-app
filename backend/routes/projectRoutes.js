const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Organization = require('../models/Organization');
const authMiddleware = require('../middleware/authMiddleware');

// All routes protected with auth
router.use(authMiddleware);

// Validation helper
const validateProject = (data) => {
  const errors = [];
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Project name is required');
  }
  if (data.name && data.name.length > 200) {
    errors.push('Project name must be less than 200 characters');
  }
  const validTypes = ['vanilla', 'react', 'nextjs', 'vue', 'angular', 'node', 'python', 'other'];
  if (data.type && !validTypes.includes(data.type)) {
    errors.push('Invalid project type');
  }
  const validStatuses = ['active', 'completed', 'archived', 'planning'];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push('Invalid project status');
  }
  return errors;
};

// @route   GET /api/projects
// @desc    Get all projects for current user (optionally filtered by organization)
// @access  Private
router.get('/projects', async (req, res) => {
  try {
    const { organization, type, status } = req.query;
    const filter = { userId: req.user.userId };

    if (organization) {
      if (organization === 'null' || organization === 'none') {
        filter.organization = null;
      } else {
        filter.organization = organization;
      }
    }
    if (type) filter.type = type;
    if (status) filter.status = status;

    const projects = await Project.find(filter)
      .populate('organization', 'name color icon')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: projects,
      count: projects.length
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch projects'
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private
router.get('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.userId
    }).populate('organization', 'name color icon');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Update last accessed
    project.lastAccessed = new Date();
    await project.save();

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Get project error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project'
    });
  }
});

// @route   POST /api/projects
// @desc    Create project
// @access  Public
router.post('/projects', async (req, res) => {
  try {
    const errors = validateProject(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: errors.join(', ')
      });
    }

    // Validate organization if provided
    if (req.body.organization && req.body.organization !== 'null') {
      const orgExists = await Organization.findById(req.body.organization);
      if (!orgExists) {
        return res.status(400).json({
          success: false,
          error: 'Invalid organization ID'
        });
      }
    }

    const project = new Project({
      userId: req.user.userId,
      name: req.body.name.trim(),
      description: req.body.description || '',
      type: req.body.type || 'other',
      organization: req.body.organization && req.body.organization !== 'null' ? req.body.organization : null,
      url: req.body.url || '',
      repository: req.body.repository || '',
      tags: req.body.tags || [],
      color: req.body.color || '#6366f1',
      icon: req.body.icon || '📁',
      status: req.body.status || 'active',
      priority: req.body.priority || 'medium',
      position: req.body.position || { x: 0, y: 0 }
    });

    const savedProject = await project.save();

    // Update organization project count
    if (savedProject.organization) {
      const org = await Organization.findById(savedProject.organization);
      if (org) {
        await org.updateProjectCount();
      }
    }

    const populatedProject = await Project.findById(savedProject._id)
      .populate('organization', 'name color icon');

    res.status(201).json({
      success: true,
      data: populatedProject
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create project'
    });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const errors = validateProject({ name: req.body.name || project.name, ...req.body });
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: errors.join(', ')
      });
    }

    const oldOrganization = project.organization;

    // Update fields
    if (req.body.name) project.name = req.body.name.trim();
    if (req.body.description !== undefined) project.description = req.body.description;
    if (req.body.type) project.type = req.body.type;
    if (req.body.organization !== undefined) {
      project.organization = req.body.organization && req.body.organization !== 'null' ? req.body.organization : null;
    }
    if (req.body.url !== undefined) project.url = req.body.url;
    if (req.body.repository !== undefined) project.repository = req.body.repository;
    if (req.body.tags) project.tags = req.body.tags;
    if (req.body.color) project.color = req.body.color;
    if (req.body.icon) project.icon = req.body.icon;
    if (req.body.status) project.status = req.body.status;
    if (req.body.priority) project.priority = req.body.priority;
    if (req.body.position) project.position = req.body.position;

    const updatedProject = await project.save();

    // Update organization counts if organization changed
    if (oldOrganization?.toString() !== updatedProject.organization?.toString()) {
      if (oldOrganization) {
        const oldOrg = await Organization.findById(oldOrganization);
        if (oldOrg) await oldOrg.updateProjectCount();
      }
      if (updatedProject.organization) {
        const newOrg = await Organization.findById(updatedProject.organization);
        if (newOrg) await newOrg.updateProjectCount();
      }
    }

    const populatedProject = await Project.findById(updatedProject._id)
      .populate('organization', 'name color icon');

    res.json({
      success: true,
      data: populatedProject
    });
  } catch (error) {
    console.error('Update project error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to update project'
    });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private
router.delete('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const organizationId = project.organization;
    await Project.findByIdAndDelete(req.params.id);

    // Update organization project count
    if (organizationId) {
      const org = await Organization.findById(organizationId);
      if (org) {
        await org.updateProjectCount();
      }
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to delete project'
    });
  }
});

// @route   POST /api/projects/:id/move
// @desc    Move project to organization
// @access  Private
router.post('/projects/:id/move', async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const { organizationId } = req.body;
    const oldOrganization = project.organization;

    // Validate new organization
    if (organizationId && organizationId !== 'null') {
      const orgExists = await Organization.findById(organizationId);
      if (!orgExists) {
        return res.status(400).json({
          success: false,
          error: 'Target organization not found'
        });
      }
    }

    project.organization = organizationId && organizationId !== 'null' ? organizationId : null;
    await project.save();

    // Update counts
    if (oldOrganization) {
      const oldOrg = await Organization.findById(oldOrganization);
      if (oldOrg) await oldOrg.updateProjectCount();
    }
    if (project.organization) {
      const newOrg = await Organization.findById(project.organization);
      if (newOrg) await newOrg.updateProjectCount();
    }

    const populatedProject = await Project.findById(project._id)
      .populate('organization', 'name color icon');

    res.json({
      success: true,
      data: populatedProject
    });
  } catch (error) {
    console.error('Move project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to move project'
    });
  }
});

module.exports = router;
