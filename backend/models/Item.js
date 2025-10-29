const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['link', 'note', 'code', 'component'],
    required: true
  },
  content: {
    type: String,
    required: true
  },

  // Basic metadata
  title: {
    type: String,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 1000
  },
  summary: {
    type: String,
    maxlength: 600
  },

  // Link-specific metadata
  domain: String,
  thumbnail: String,
  favicon: String,
  image: String,

  // Platform detection (YouTube, Instagram, GitHub, Twitter, etc.)
  platform: {
    type: String,
    enum: ['youtube', 'instagram', 'github', 'twitter', 'linkedin', 'facebook', 'medium', 'reddit', 'tiktok', 'website', 'other'],
    default: 'website'
  },

  // AI-detected category (for videos/content)
  category: {
    type: String,
    enum: ['education', 'technology', 'entertainment', 'ai', 'programming', 'design', 'business', 'music', 'gaming', 'news', 'lifestyle', 'other'],
    default: 'other'
  },

  // Additional metadata
  publishedDate: Date,
  author: String,
  language: String,
  contentType: String,
  readabilityScore: Number,

  // AI-generated data
  tags: [String],
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  notes: {
    type: String,
    maxlength: 200
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
ItemSchema.index({ type: 1, createdAt: -1 });
ItemSchema.index({ tags: 1 });
ItemSchema.index({ domain: 1 });

module.exports = mongoose.model('Item', ItemSchema);
