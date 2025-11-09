const express = require('express');
const router = express.Router();
const multer = require('multer');
const FileItem = require('../models/FileItem');
const Industry = require('../models/Industry');

// Configure multer for file uploads (memory storage for serverless)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit per file
  }
});

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
router.post('/files/upload', upload.array('files', 20), async (req, res) => {
  try {
    const files = req.files;
    const { industry } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files provided' });
    }

    // Validate industry if provided
    if (industry && industry !== 'null' && industry !== 'undefined') {
      const industryExists = await Industry.findById(industry);
      if (!industryExists) {
        return res.status(400).json({ success: false, error: 'Invalid industry ID' });
      }
    }

    const uploadedFiles = [];

    // For serverless, we store metadata only (files stored in memory buffer)
    // In production, you'd upload to cloud storage (S3, Cloudinary, etc.)
    for (const file of files) {
      // Detect file category from mime type
      let category = 'other';
      if (file.mimetype.includes('pdf')) category = 'pdf';
      else if (file.mimetype.includes('word') || file.mimetype.includes('document')) category = 'document';
      else if (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheet')) category = 'spreadsheet';
      else if (file.mimetype.includes('powerpoint') || file.mimetype.includes('presentation')) category = 'presentation';
      else if (file.mimetype.includes('image')) category = 'image';
      else if (file.mimetype.includes('video')) category = 'video';
      else if (file.mimetype.includes('audio')) category = 'audio';
      else if (file.mimetype.includes('zip') || file.mimetype.includes('rar') || file.mimetype.includes('tar')) category = 'archive';
      else if (file.mimetype.includes('text') || file.originalname.match(/\.(txt|md|json|xml|csv|log)$/i)) category = 'text';
      else if (file.originalname.match(/\.(js|jsx|ts|tsx|py|java|cpp|c|html|css|php|rb|go|rs)$/i)) category = 'code';

      const fileItem = new FileItem({
        name: file.originalname,
        path: `/uploads/${Date.now()}-${file.originalname}`, // In production, upload to cloud and store URL
        size: file.size,
        type: file.mimetype,
        category: category,
        industry: (industry && industry !== 'null' && industry !== 'undefined') ? industry : null
      });

      const savedFile = await fileItem.save();
      uploadedFiles.push(savedFile);
    }

    // Update industry file count
    if (industry && industry !== 'null' && industry !== 'undefined') {
      const ind = await Industry.findById(industry);
      if (ind) {
        await ind.updateFileCount();
      }
    }

    res.status(201).json({
      success: true,
      data: uploadedFiles,
      message: `${uploadedFiles.length} file(s) uploaded successfully`
    });
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
