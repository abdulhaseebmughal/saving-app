const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const LoginConfirmation = require('../models/LoginConfirmation');
const { sendLoginConfirmation } = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'saveit-ai-secret-key-2025';
const STATIC_PASSWORD = 'HaseebKhan19006';
const ADMIN_EMAIL = 'abdulhaseebmughal2006@gmail.com';

// POST /api/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Verify static password
    if (password !== STATIC_PASSWORD) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Find or create user
    let user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      user = new User({
        username: username.toLowerCase(),
        password: STATIC_PASSWORD
      });
      await user.save();
    }

    // Get login info
    const ipAddress = req.headers['x-forwarded-for'] ||
                     req.headers['x-real-ip'] ||
                     req.connection.remoteAddress ||
                     req.socket.remoteAddress ||
                     'Unknown';

    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Generate confirmation token
    const confirmToken = crypto.randomBytes(32).toString('hex');

    // Generate temporary JWT (will be replaced after confirmation)
    const tempToken = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        temp: true
      },
      JWT_SECRET,
      { expiresIn: '10m' }
    );

    // Create login confirmation record
    const loginConfirmation = new LoginConfirmation({
      userId: user._id,
      username: user.username,
      email: ADMIN_EMAIL,
      confirmToken,
      ipAddress,
      userAgent,
      tempToken,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    await loginConfirmation.save();

    // Try to send confirmation email
    try {
      const emailResult = await sendLoginConfirmation(ADMIN_EMAIL, {
        username: user.username,
        ipAddress,
        userAgent,
        confirmToken,
        location: 'Unknown' // Can be enhanced with IP geolocation service
      });

      if (!emailResult.success) {
        console.error('Failed to send confirmation email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('Email service error:', emailError);
      // Continue even if email fails - for now, auto-confirm for development
      loginConfirmation.confirmed = true;
      await loginConfirmation.save();
    }

    res.json({
      success: true,
      data: {
        tempToken,
        message: 'Please check your email to confirm this login',
        expiresIn: '10 minutes',
        awaitingConfirmation: true
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// GET /api/auth/verify
router.get('/auth/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username
        }
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

// GET /api/auth/confirm-login
router.get('/auth/confirm-login', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Confirmation token is required'
      });
    }

    // Find the login confirmation
    const confirmation = await LoginConfirmation.findOne({
      confirmToken: token,
      confirmed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!confirmation) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired confirmation link'
      });
    }

    // Mark as confirmed
    confirmation.confirmed = true;
    await confirmation.save();

    // Update user last login
    const user = await User.findById(confirmation.userId);
    if (user) {
      user.lastLogin = new Date();
      await user.save();
    }

    // Generate final JWT token (30-day expiry)
    const token = jwt.sign(
      {
        userId: confirmation.userId,
        username: confirmation.username
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'https://saving-app-ador.vercel.app';
    res.redirect(`${frontendUrl}/auth/confirmed?token=${token}`);
  } catch (error) {
    console.error('Confirm login error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm login'
    });
  }
});

// POST /api/auth/check-confirmation
router.post('/auth/check-confirmation', async (req, res) => {
  try {
    const { tempToken } = req.body;

    if (!tempToken) {
      return res.status(400).json({
        success: false,
        error: 'Temp token is required'
      });
    }

    // Verify temp token
    const decoded = jwt.verify(tempToken, JWT_SECRET);

    // Check if login has been confirmed
    const confirmation = await LoginConfirmation.findOne({
      userId: decoded.userId,
      tempToken,
      confirmed: true
    });

    if (confirmation) {
      // Generate final token
      const finalToken = jwt.sign(
        {
          userId: decoded.userId,
          username: decoded.username
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.json({
        success: true,
        confirmed: true,
        data: {
          token: finalToken,
          user: {
            id: decoded.userId,
            username: decoded.username
          }
        }
      });
    }

    // Check if expired
    const pendingConfirmation = await LoginConfirmation.findOne({
      userId: decoded.userId,
      tempToken,
      confirmed: false
    });

    if (!pendingConfirmation || pendingConfirmation.expiresAt < new Date()) {
      return res.json({
        success: false,
        confirmed: false,
        expired: true,
        message: 'Login confirmation expired. Please login again.'
      });
    }

    res.json({
      success: true,
      confirmed: false,
      message: 'Awaiting email confirmation'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.json({
        success: false,
        confirmed: false,
        expired: true,
        message: 'Login session expired. Please login again.'
      });
    }

    console.error('Check confirmation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check confirmation status'
    });
  }
});

module.exports = router;
