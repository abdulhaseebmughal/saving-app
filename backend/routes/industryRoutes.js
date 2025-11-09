const express = require('express');
const router = express.Router();
const Industry = require('../models/Industry');
const FileItem = require('../models/FileItem');

// Validation
const validateIndustry = (data) => {
  const errors = [];
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Industry name is required');
  }
  if (data.name && data.name.length > 100) {
    errors.push('Industry name must be less than 100 characters');
  }
  return errors;
};

// GET /api/industries
router.get('/industries', async (req, res) => {
  try {
    const industries = await Industry.find().sort({ position: 1, createdAt: -1 });
    res.json({ success: true, data: industries, count: industries.length });
  } catch (error) {
    console.error('Get industries error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch industries' });
  }
});

// GET /api/industries/:id
router.get('/industries/:id', async (req, res) => {
  try {
    const industry = await Industry.findById(req.params.id);
    if (!industry) {
      return res.status(404).json({ success: false, error: 'Industry not found' });
    }
    res.json({ success: true, data: industry });
  } catch (error) {
    console.error('Get industry error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, error: 'Invalid industry ID' });
    }
    res.status(500).json({ success: false, error: 'Failed to fetch industry' });
  }
});

// POST /api/industries
router.post('/industries', async (req, res) => {
  try {
    const errors = validateIndustry(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: errors.join(', ') });
    }

    const industry = new Industry({
      name: req.body.name.trim(),
      description: req.body.description || '',
      icon: req.body.icon || '🏢',
      color: req.body.color || '#6366f1',
      position: req.body.position || 0
    });

    const savedIndustry = await industry.save();
    res.status(201).json({ success: true, data: savedIndustry });
  } catch (error) {
    console.error('Create industry error:', error);
    res.status(500).json({ success: false, error: 'Failed to create industry' });
  }
});

// PUT /api/industries/:id
router.put('/industries/:id', async (req, res) => {
  try {
    const industry = await Industry.findById(req.params.id);
    if (!industry) {
      return res.status(404).json({ success: false, error: 'Industry not found' });
    }

    const errors = validateIndustry(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: errors.join(', ') });
    }

    if (req.body.name) industry.name = req.body.name.trim();
    if (req.body.description !== undefined) industry.description = req.body.description;
    if (req.body.icon) industry.icon = req.body.icon;
    if (req.body.color) industry.color = req.body.color;
    if (req.body.position !== undefined) industry.position = req.body.position;

    const updatedIndustry = await industry.save();
    res.json({ success: true, data: updatedIndustry });
  } catch (error) {
    console.error('Update industry error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, error: 'Invalid industry ID' });
    }
    res.status(500).json({ success: false, error: 'Failed to update industry' });
  }
});

// DELETE /api/industries/:id
router.delete('/industries/:id', async (req, res) => {
  try {
    const industry = await Industry.findById(req.params.id);
    if (!industry) {
      return res.status(404).json({ success: false, error: 'Industry not found' });
    }

    const fileCount = await FileItem.countDocuments({ industry: req.params.id });
    if (fileCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete industry with ${fileCount} file(s). Please move or delete files first.`
      });
    }

    await Industry.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Industry deleted successfully' });
  } catch (error) {
    console.error('Delete industry error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, error: 'Invalid industry ID' });
    }
    res.status(500).json({ success: false, error: 'Failed to delete industry' });
  }
});

module.exports = router;
