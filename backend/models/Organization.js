const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  icon: {
    type: String,
    default: '🏢'
  },
  projectCount: {
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

// Update project count when projects change
organizationSchema.methods.updateProjectCount = async function() {
  const Project = mongoose.model('Project');
  this.projectCount = await Project.countDocuments({ organization: this._id });
  await this.save();
};

module.exports = mongoose.model('Organization', organizationSchema);
