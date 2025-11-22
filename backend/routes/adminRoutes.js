/**
 * Admin Routes - Full Database Management
 * Clean, optimized code with proper error handling
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Item = require('../models/Item');
const Note = require('../models/Note');
const DiaryNote = require('../models/DiaryNote');
const Project = require('../models/Project');
const FileItem = require('../models/FileItem');
const Organization = require('../models/Organization');
const Industry = require('../models/Industry');

// Admin credentials
const ADMIN_EMAIL = 'abdulhaseebmughal2006@gmail.com';
const ADMIN_PASSWORD = 'Haseebkhan19006';

/**
 * Admin Authentication Middleware
 * Validates admin credentials from request headers
 */
const adminAuth = (req, res, next) => {
  try {
    // Get credentials from body OR headers OR query params (case insensitive for headers)
    const email = req.body?.email ||
                  req.query?.email ||
                  req.headers.email ||
                  req.headers['email'] ||
                  req.headers.Email ||
                  req.headers['Email'];

    const password = req.body?.password ||
                     req.query?.password ||
                     req.headers.password ||
                     req.headers['password'] ||
                     req.headers.Password ||
                     req.headers['Password'];

    console.log('Admin auth attempt:', {
      email: email ? email : 'MISSING',
      password: password ? '***' : 'MISSING',
      allHeaders: Object.keys(req.headers),
      source: req.body?.email ? 'body' : (req.query?.email ? 'query' : 'headers')
    });

    if (!email || !password) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      console.log('Admin authenticated successfully');
      next();
    } else {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * GET /api/admin/dashboard
 * Returns all database collections + admin personal data + statistics
 */
router.get('/admin/dashboard', adminAuth, async (req, res) => {
  try {
    console.log('Fetching admin dashboard...');

    // Find admin user
    const adminUser = await User.findOne({ email: ADMIN_EMAIL });
    console.log('Admin user found:', adminUser ? 'Yes' : 'No');

    // Fetch all collections in parallel for performance
    const [users, items, notes, diaryNotes, projects, files, organizations, industries] = await Promise.all([
      User.find().select('-password -otp -otpExpiry').sort({ createdAt: -1 }).lean(),
      Item.find().populate('userId', 'name email').sort({ createdAt: -1 }).lean(),
      Note.find().populate('userId', 'name email').sort({ createdAt: -1 }).lean(),
      DiaryNote.find().populate('userId', 'name email').sort({ createdAt: -1 }).lean(),
      Project.find().populate('userId', 'name email').populate('organization').sort({ createdAt: -1 }).lean(),
      FileItem.find().select('-content').populate('userId', 'name email').populate('industry').sort({ createdAt: -1 }).lean(),
      Organization.find().populate('userId', 'name email').sort({ createdAt: -1 }).lean(),
      Industry.find().populate('userId', 'name email').sort({ createdAt: -1 }).lean()
    ]);

    console.log('Data fetched:', {
      users: users.length,
      items: items.length,
      notes: notes.length,
      diaryNotes: diaryNotes.length,
      projects: projects.length,
      files: files.length,
      organizations: organizations.length,
      industries: industries.length
    });

    // Filter admin's personal data
    const adminData = adminUser ? {
      items: items.filter(i => i.userId?._id?.toString() === adminUser._id.toString()),
      notes: notes.filter(n => n.userId?._id?.toString() === adminUser._id.toString()),
      diaryNotes: diaryNotes.filter(d => d.userId?._id?.toString() === adminUser._id.toString()),
      projects: projects.filter(p => p.userId?._id?.toString() === adminUser._id.toString()),
      files: files.filter(f => f.userId?._id?.toString() === adminUser._id.toString()),
      organizations: organizations.filter(o => o.userId?._id?.toString() === adminUser._id.toString()),
      industries: industries.filter(ind => ind.userId?._id?.toString() === adminUser._id.toString())
    } : null;

    console.log('Admin personal data:', adminData ? {
      items: adminData.items.length,
      notes: adminData.notes.length,
      diaryNotes: adminData.diaryNotes.length,
      projects: adminData.projects.length,
      files: adminData.files.length,
      organizations: adminData.organizations.length,
      industries: adminData.industries.length
    } : 'No admin user');

    res.json({
      success: true,
      data: {
        users,
        items,
        notes,
        diaryNotes,
        projects,
        files,
        organizations,
        industries
      },
      adminData,
      stats: {
        totalUsers: users.length,
        totalItems: items.length,
        totalNotes: notes.length,
        totalDiaryNotes: diaryNotes.length,
        totalProjects: projects.length,
        totalFiles: files.length,
        totalOrganizations: organizations.length,
        totalIndustries: industries.length,
        adminItems: adminData?.items.length || 0,
        adminNotes: adminData?.notes.length || 0,
        adminDiaryNotes: adminData?.diaryNotes.length || 0,
        adminProjects: adminData?.projects.length || 0,
        adminFiles: adminData?.files.length || 0,
        adminOrganizations: adminData?.organizations.length || 0,
        adminIndustries: adminData?.industries.length || 0
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch dashboard data'
    });
  }
});

/**
 * DELETE /api/admin/:collection/:id
 * Generic delete endpoint for any collection
 */
const deleteHandlers = {
  users: async (id) => await User.findByIdAndDelete(id),
  items: async (id) => await Item.findByIdAndDelete(id),
  notes: async (id) => await Note.findByIdAndDelete(id),
  'diary-notes': async (id) => await DiaryNote.findByIdAndDelete(id),
  projects: async (id) => await Project.findByIdAndDelete(id),
  files: async (id) => await FileItem.findByIdAndDelete(id),
  organizations: async (id) => await Organization.findByIdAndDelete(id),
  industries: async (id) => await Industry.findByIdAndDelete(id)
};

router.delete('/admin/:collection/:id', adminAuth, async (req, res) => {
  try {
    const { collection, id } = req.params;

    console.log(`Deleting ${collection}/${id}`);

    if (!deleteHandlers[collection]) {
      return res.status(400).json({
        success: false,
        error: `Invalid collection: ${collection}`
      });
    }

    const result = await deleteHandlers[collection](id);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    console.log(`Successfully deleted ${collection}/${id}`);
    res.json({
      success: true,
      message: `${collection} item deleted successfully`
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete item'
    });
  }
});

module.exports = router;
