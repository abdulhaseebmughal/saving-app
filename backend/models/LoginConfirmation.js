const mongoose = require('mongoose');

const loginConfirmationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  confirmToken: {
    type: String,
    required: true,
    unique: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  location: {
    type: String
  },
  confirmed: {
    type: Boolean,
    default: false
  },
  tempToken: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries and auto-deletion
loginConfirmationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
loginConfirmationSchema.index({ confirmToken: 1 });
loginConfirmationSchema.index({ userId: 1, confirmed: 1 });

module.exports = mongoose.model('LoginConfirmation', loginConfirmationSchema);
