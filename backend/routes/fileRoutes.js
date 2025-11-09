const express = require('express');
const router = express.Router();
const FileItem = require('../models/FileItem');
const Industry = require('../models/Industry');

// GET /api/files
router.get('/files', async (req, res) => {
  try {
    const { industry } = req.query;
    const filter = {};

    if (industry) {
      if (industry === 'null' || industry === 'none') {
        filter.industry = null;
      } else {
        filter.industry = industry;
      }
    }

    const files = await FileItem.find(filter)
      .populate('industry', 'name icon color')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: files, count: files.length });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch files' });
  }
});

// GET /api/files/:id
router.get('/files/:id', async (req, res) => {
  try {
    const file = await FileItem.findById(req.params.id)
      .populate('industry', 'name icon color');

    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    res.json({ success: true, data: file });
  } catch (error) {
    console.error('Get file error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, error: 'Invalid file ID' });
    }
    res.status(500).json({ success: false, error: 'Failed to fetch file' });
  }
});

// POST /api/files/upload
router.post('/files/upload', async (req, res) => {
  try {
    const { files, industry } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files provided' });
    }

    // Validate industry if provided
    if (industry && industry !== 'null') {
      const industryExists = await Industry.findById(industry);
      if (!industryExists) {
        return res.status(400).json({ success: false, error: 'Invalid industry ID' });
      }
    }

    const uploadedFiles = [];

    for (const fileData of files) {
      const file = new FileItem({
        name: fileData.name,
        path: fileData.path || `/uploads/${Date.now()}-${fileData.name}`,
        size: fileData.size,
        type: fileData.type,
        industry: industry && industry !== 'null' ? industry : null
      });

      const savedFile = await file.save();
      uploadedFiles.push(savedFile);
    }

    // Update industry file count
    if (industry && industry !== 'null') {
      const ind = await Industry.findById(industry);
      if (ind) {
        await ind.updateFileCount();
      }
    }

    res.status(201).json({ success: true, data: uploadedFiles });
  } catch (error) {
    console.error('Upload files error:', error);
    res.status(500).json({ success: false, error: 'Failed to upload files' });
  }
});

// DELETE /api/files/:id
router.delete('/files/:id', async (req, res) => {
  try {
    const file = await FileItem.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    const industryId = file.industry;
    await FileItem.findByIdAndDelete(req.params.id);

    // Update industry file count
    if (industryId) {
      const ind = await Industry.findById(industryId);
      if (ind) {
        await ind.updateFileCount();
      }
    }

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, error: 'Invalid file ID' });
    }
    res.status(500).json({ success: false, error: 'Failed to delete file' });
  }
});

// POST /api/files/:id/move
router.post('/files/:id/move', async (req, res) => {
  try {
    const file = await FileItem.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    const { industryId } = req.body;
    const oldIndustry = file.industry;

    // Validate new industry
    if (industryId && industryId !== 'null') {
      const industryExists = await Industry.findById(industryId);
      if (!industryExists) {
        return res.status(400).json({ success: false, error: 'Target industry not found' });
      }
    }

    file.industry = industryId && industryId !== 'null' ? industryId : null;
    await file.save();

    // Update counts
    if (oldIndustry) {
      const oldInd = await Industry.findById(oldIndustry);
      if (oldInd) await oldInd.updateFileCount();
    }
    if (file.industry) {
      const newInd = await Industry.findById(file.industry);
      if (newInd) await newInd.updateFileCount();
    }

    const populatedFile = await FileItem.findById(file._id)
      .populate('industry', 'name icon color');

    res.json({ success: true, data: populatedFile });
  } catch (error) {
    console.error('Move file error:', error);
    res.status(500).json({ success: false, error: 'Failed to move file' });
  }
});

module.exports = router;
