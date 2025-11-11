const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  // User ownership
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['vanilla', 'react', 'nextjs', 'vue', 'angular', 'node', 'python', 'other'],
    default: 'other'
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    default: null
  },
  url: {
    type: String,
    default: ''
  },
  repository: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  color: {
    type: String,
    default: '#6366f1'
  },
  icon: {
    type: String,
    default: '📁'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'archived', 'planning'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  files: [{
    name: String,
    path: String,
    size: Number,
    type: String
  }],
  lastAccessed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
projectSchema.index({ userId: 1, createdAt: -1 });
projectSchema.index({ userId: 1, organization: 1, createdAt: -1 });
projectSchema.index({ userId: 1, type: 1 });
projectSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Project', projectSchema);
