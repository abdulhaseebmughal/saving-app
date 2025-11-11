const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTP } = require('../services/emailService');
const { asyncHandler } = require('../middleware/errorHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'saveit-ai-secret-key-2025';
const JWT_EXPIRY = '30d'; // 30 days for persistent login

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password -otp');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

/**
 * POST /api/auth/signup
 * Step 1: Register new user and send OTP
 */
router.post('/auth/signup', asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Name, email, and password are required'
    });
  }

  // Validate email format
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format'
    });
  }

  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters'
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    if (existingUser.isVerified) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered. Please login instead.'
      });
    } else {
      // User exists but not verified - resend OTP
      const otp = existingUser.generateOTP('signup');
      await existingUser.save();

      const emailResult = await sendOTP(email, otp, 'signup', name);

      return res.json({
        success: true,
        message: 'OTP resent to your email. Please verify to complete signup.',
        emailSent: emailResult.success
      });
    }
  }

  // Create new user
  const user = new User({
    name,
    email: email.toLowerCase(),
    password,
    isVerified: false
  });

  // Generate and save OTP
  const otp = user.generateOTP('signup');
  await user.save();

  // Send OTP email
  const emailResult = await sendOTP(email, otp, 'signup', name);

  res.status(201).json({
    success: true,
    message: 'Signup successful! Please check your email for OTP.',
    emailSent: emailResult.success
  });
}));

/**
 * POST /api/auth/verify-signup
 * Step 2: Verify OTP and complete signup
 */
router.post('/auth/verify-signup', asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      error: 'Email and OTP are required'
    });
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  if (user.isVerified) {
    return res.status(400).json({
      success: false,
      error: 'Email already verified. Please login.'
    });
  }

  // Verify OTP
  if (!user.verifyOTP(otp, 'signup')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or expired OTP'
    });
  }

  // Mark user as verified and clear OTP
  user.isVerified = true;
  user.clearOTP();
  user.lastLogin = new Date();
  await user.save();

  // Generate JWT token
  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );

  res.json({
    success: true,
    message: 'Email verified successfully!',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    }
  });
}));

/**
 * POST /api/auth/login
 * Step 1: Request OTP for login
 */
router.post('/auth/login', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Email is required'
    });
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'No account found with this email'
    });
  }

  if (!user.isVerified) {
    return res.status(403).json({
      success: false,
      error: 'Please complete signup verification first'
    });
  }

  // Generate and save OTP
  const otp = user.generateOTP('login');
  await user.save();

  // Send OTP email
  const emailResult = await sendOTP(email, otp, 'login', user.name);

  res.json({
    success: true,
    message: 'OTP sent to your email',
    emailSent: emailResult.success
  });
}));

/**
 * POST /api/auth/verify-login
 * Step 2: Verify OTP and complete login
 */
router.post('/auth/verify-login', asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      error: 'Email and OTP are required'
    });
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Verify OTP
  if (!user.verifyOTP(otp, 'login')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or expired OTP'
    });
  }

  // Update last login and clear OTP
  user.lastLogin = new Date();
  user.clearOTP();
  await user.save();

  // Generate JWT token
  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );

  res.json({
    success: true,
    message: 'Login successful!',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    }
  });
}));

/**
 * POST /api/auth/forgot-password
 * Step 1: Request OTP for password reset
 */
router.post('/auth/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Email is required'
    });
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    // Don't reveal if email exists
    return res.json({
      success: true,
      message: 'If an account exists with this email, you will receive an OTP'
    });
  }

  // Generate and save OTP
  const otp = user.generateOTP('forgot-password');
  await user.save();

  // Send OTP email
  await sendOTP(email, otp, 'forgot-password', user.name);

  res.json({
    success: true,
    message: 'OTP sent to your email'
  });
}));

/**
 * POST /api/auth/reset-password
 * Step 2: Verify OTP and reset password
 */
router.post('/auth/reset-password', asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      error: 'Email, OTP, and new password are required'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters'
    });
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Verify OTP
  if (!user.verifyOTP(otp, 'forgot-password')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or expired OTP'
    });
  }

  // Update password and clear OTP
  user.password = newPassword;
  user.clearOTP();
  await user.save();

  res.json({
    success: true,
    message: 'Password reset successful! Please login with your new password.'
  });
}));

/**
 * GET /api/auth/verify
 * Verify current token and get user info
 */
router.get('/auth/verify', authenticate, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    }
  });
}));

/**
 * GET /api/auth/profile
 * Get user profile
 */
router.get('/auth/profile', authenticate, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt,
        lastLogin: req.user.lastLogin
      }
    }
  });
}));

/**
 * PUT /api/auth/profile
 * Update user profile (name, email)
 */
router.put('/auth/profile', authenticate, asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  const user = req.user;

  // Update name if provided
  if (name) {
    if (name.length < 2 || name.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Name must be between 2 and 50 characters'
      });
    }
    user.name = name;
  }

  // Update email if provided and different
  if (email && email.toLowerCase() !== user.email) {
    // Check if new email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already in use'
      });
    }

    user.email = email.toLowerCase();
    user.isVerified = false; // Require re-verification

    // Generate OTP for email verification
    const otp = user.generateOTP('signup');
    await user.save();

    // Send OTP to new email
    await sendOTP(email, otp, 'signup', user.name);

    return res.json({
      success: true,
      message: 'Email updated. Please verify your new email with the OTP sent.',
      requiresVerification: true
    });
  }

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    }
  });
}));

/**
 * PUT /api/auth/change-password
 * Change password (requires current password)
 */
router.put('/auth/change-password', authenticate, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      error: 'Current password and new password are required'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'New password must be at least 6 characters'
    });
  }

  const user = await User.findById(req.user._id);

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      error: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

/**
 * POST /api/auth/logout
 * Logout (client-side token removal, but endpoint for tracking)
 */
router.post('/auth/logout', authenticate, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

module.exports = router;
