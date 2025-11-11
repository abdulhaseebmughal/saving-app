const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const { body, validationResult, query } = require('express-validator');
const Item = require('../models/Item');
const { generateLinkMetadata, generateSummary, extractDomain, detectPlatform, detectCategory } = require('../utils/gemini');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @route   GET /api
 * @desc    API Base route - Status check (public)
 */
router.get('/', async (req, res) => {
  try {
    const totalItems = await Item.countDocuments();
    res.json({
      success: true,
      message: 'SaveIt.AI API is running',
      version: '1.0.0',
      endpoints: {
        save: 'POST /api/save',
        getAll: 'GET /api/items',
        getOne: 'GET /api/item/:id',
        update: 'PUT /api/item/:id',
        delete: 'DELETE /api/item/:id',
        stats: 'GET /api/stats'
      },
      totalItems
    });
  } catch (err) {
    res.json({
      success: true,
      message: 'SaveIt.AI API is running',
      version: '1.0.0',
      endpoints: {
        save: 'POST /api/save',
        getAll: 'GET /api/items',
        getOne: 'GET /api/item/:id',
        update: 'PUT /api/item/:id',
        delete: 'DELETE /api/item/:id',
        stats: 'GET /api/stats'
      }
    });
  }
});

/**
 * @route   POST /api/save
 * @desc    Save new item (link, note, code, or component)
 */
router.post('/save',
  authMiddleware,
  [
    body('type').isIn(['link', 'note', 'code', 'component']).withMessage('Invalid type'),
    body('content').notEmpty().withMessage('Content is required')
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { type, content, title: customTitle } = req.body;

      let itemData = {
        type,
        content
      };

      // Handle link type with metadata extraction
      if (type === 'link') {
        try {
          // Scrape the webpage
          const { data: html } = await axios.get(content, {
            timeout: 10000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });

          const $ = cheerio.load(html);

          // Extract basic metadata from HTML
          const scrapedData = {
            title: $('meta[property="og:title"]').attr('content') ||
              $('meta[name="twitter:title"]').attr('content') ||
              $('title').text() ||
              null,
            description: $('meta[property="og:description"]').attr('content') ||
              $('meta[name="twitter:description"]').attr('content') ||
              $('meta[name="description"]').attr('content') ||
              null,
            image: $('meta[property="og:image"]').attr('content') ||
              $('meta[name="twitter:image"]').attr('content') ||
              null,
            favicon: $('link[rel="icon"]').attr('href') ||
              $('link[rel="shortcut icon"]').attr('href') ||
              null,
            author: $('meta[name="author"]').attr('content') ||
              $('meta[property="article:author"]').attr('content') ||
              null,
            publishedDate: $('meta[property="article:published_time"]').attr('content') ||
              null
          };

          // Make favicon absolute URL if relative
          if (scrapedData.favicon && !scrapedData.favicon.startsWith('http')) {
            const urlObj = new URL(content);
            scrapedData.favicon = new URL(scrapedData.favicon, urlObj.origin).href;
          }

          // Use Gemini AI to enhance metadata
          const aiMetadata = await generateLinkMetadata(content, scrapedData);

          // Detect platform (YouTube, Instagram, GitHub, etc.)
          const platform = detectPlatform(content);

          // Detect category using AI (education, tech, entertainment, etc.)
          const category = await detectCategory(aiMetadata, platform);

          // Merge scraped and AI data
          itemData = {
            ...itemData,
            title: customTitle || aiMetadata.title || scrapedData.title,
            description: aiMetadata.description,
            summary: aiMetadata.summary,
            domain: aiMetadata.domain || extractDomain(content),
            thumbnail: aiMetadata.image || scrapedData.image,
            image: aiMetadata.image || scrapedData.image,
            favicon: aiMetadata.favicon || scrapedData.favicon,
            publishedDate: aiMetadata.published_date ? new Date(aiMetadata.published_date) : null,
            author: aiMetadata.author,
            language: aiMetadata.language,
            contentType: aiMetadata.content_type,
            readabilityScore: aiMetadata.readability_score,
            tags: aiMetadata.tags,
            confidence: aiMetadata.confidence,
            notes: aiMetadata.notes,
            platform: platform,
            category: category
          };

        } catch (scrapeError) {
          console.error('Scraping error:', scrapeError.message);

          // Fallback: minimal data with domain
          itemData.domain = extractDomain(content);
          itemData.title = customTitle || content;
          itemData.notes = 'Failed to scrape webpage';
          itemData.confidence = 0.2;
        }
      } else {
        // Handle non-link types (note, code, component)
        const aiResult = await generateSummary(content, type);

        itemData = {
          ...itemData,
          title: customTitle || content.substring(0, 100),
          summary: aiResult.summary,
          tags: aiResult.tags
        };
      }

      // Save to database with userId
      const newItem = new Item({ ...itemData, userId: req.user.userId });
      await newItem.save();

      res.status(201).json({
        success: true,
        data: newItem
      });

    } catch (err) {
      console.error('Save error:', err);
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
);

/**
 * @route   GET /api/items
 * @desc    Fetch all items with optional filtering and pagination
 */
router.get('/items',
  authMiddleware,
  [
    query('type').optional().isIn(['link', 'note', 'code', 'component']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('tags').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        type,
        page = 1,
        limit = 20,
        search,
        tags
      } = req.query;

      // Build query for current user only
      let query = { userId: req.user.userId };

      if (type) {
        query.type = type;
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { summary: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ];
      }

      if (tags) {
        const tagArray = tags.split(',').map(t => t.trim());
        query.tags = { $in: tagArray };
      }

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const items = await Item.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Item.countDocuments(query);

      res.json({
        success: true,
        data: items,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (err) {
      console.error('Fetch error:', err);
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
);

/**
 * @route   GET /api/item/:id
 * @desc    Get single item by ID
 */
router.get('/item/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, userId: req.user.userId });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });

  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * @route   PUT /api/item/:id
 * @desc    Update item by ID
 */
router.put('/item/:id',
  authMiddleware,
  [
    body('title').optional().isString(),
    body('description').optional().isString(),
    body('tags').optional().isArray()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const allowedUpdates = ['title', 'description', 'tags', 'notes'];
      const updates = {};

      for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
          updates[key] = req.body[key];
        }
      }

      updates.updatedAt = Date.now();

      const item = await Item.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId },
        updates,
        { new: true, runValidators: true }
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Item not found'
        });
      }

      res.json({
        success: true,
        data: item
      });

    } catch (err) {
      console.error('Update error:', err);
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
);

/**
 * @route   DELETE /api/item/:id
 * @desc    Delete item by ID
 */
router.delete('/item/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });

  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * @route   GET /api/stats
 * @desc    Get statistics about saved items
 */
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const totalItems = await Item.countDocuments({ userId: req.user.userId });
    const itemsByType = await Item.aggregate([
      { $match: { userId: req.user.userId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const topTags = await Item.aggregate([
      { $match: { userId: req.user.userId } },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        totalItems,
        itemsByType,
        topTags
      }
    });

  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
