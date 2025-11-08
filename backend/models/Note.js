const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  // Note content
  text: {
    type: String,
    required: false, // Allow empty notes - users can add text later
    default: '',
    maxlength: 2000
  },

  // Visual styling
  color: {
    type: String,
    default: '#fef08a', // yellow-200
    enum: [
      '#fef08a', // yellow
      '#fecaca', // red
      '#bfdbfe', // blue
      '#bbf7d0', // green
      '#ddd6fe', // purple
      '#fed7aa', // orange
      '#fbcfe8', // pink
      '#d1d5db', // gray
    ]
  },

  // Position on board
  position: {
    x: {
      type: Number,
      default: 100
    },
    y: {
      type: Number,
      default: 100
    }
  },

  // Size
  size: {
    width: {
      type: Number,
      default: 250
    },
    height: {
      type: Number,
      default: 250
    }
  },

  // Attached links (reference to Item model)
  attachedLinks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  }],

  // Z-index for layering
  zIndex: {
    type: Number,
    default: 1
  },

  // Pin status
  isPinned: {
    type: Boolean,
    default: false
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
NoteSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Note', NoteSchema);
