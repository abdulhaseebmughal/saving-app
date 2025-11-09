const mongoose = require('mongoose');

const fileItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['code', 'pdf', 'document', 'spreadsheet', 'presentation', 'image', 'video', 'audio', 'archive', 'text', 'other'],
    default: 'other'
  },
  industry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Industry',
    default: null
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
fileItemSchema.index({ industry: 1, createdAt: -1 });
fileItemSchema.index({ name: 'text' });

module.exports = mongoose.model('FileItem', fileItemSchema);
