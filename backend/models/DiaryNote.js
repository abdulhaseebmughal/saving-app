const mongoose = require('mongoose');

const DiaryNoteSchema = new mongoose.Schema({
  // User ownership
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  title: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#FFF9E6'
  },
  isPinned: {
    type: Boolean,
    default: false
  },
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
DiaryNoteSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('DiaryNote', DiaryNoteSchema);
