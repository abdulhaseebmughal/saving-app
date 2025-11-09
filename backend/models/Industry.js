const mongoose = require('mongoose');

const industrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: '🏢'
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  fileCount: {
    type: Number,
    default: 0
  },
  position: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Update file count
industrySchema.methods.updateFileCount = async function() {
  const FileItem = mongoose.model('FileItem');
  this.fileCount = await FileItem.countDocuments({ industry: this._id });
  await this.save();
};

module.exports = mongoose.model('Industry', industrySchema);
