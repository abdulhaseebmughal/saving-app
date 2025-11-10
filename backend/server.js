const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { validateBodySize, rateLimiter } = require('./middleware/requestValidator');
const itemRoutes = require('./routes/itemRoutes');
const noteRoutes = require('./routes/noteRoutes');
const diaryNoteRoutes = require('./routes/diaryNoteRoutes');
const projectRoutes = require('./routes/projectRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const authRoutes = require('./routes/authRoutes');
const industryRoutes = require('./routes/industryRoutes');
const fileRoutes = require('./routes/fileRoutes');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB (async for serverless compatibility)
// Connection will be established on first request in production
connectDB().catch(err => {
  console.error('Initial MongoDB connection failed:', err.message);
  // Don't crash the app, let routes handle connection errors
});

// Middleware - Allow both local and production frontend
const allowedOrigins = [
  'http://localhost:3000',
  'https://saving-app-ador.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Allow all Vercel preview deployments
    if (origin && (
      origin.includes('vercel.app') ||
      origin.includes('localhost') ||
      allowedOrigins.includes(origin)
    )) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(validateBodySize);
// Rate limiter disabled in production (use Vercel's rate limiting instead)
if (process.env.NODE_ENV !== 'production') {
  app.use(rateLimiter(200, 60000)); // 200 requests per minute
}

// Ensure MongoDB connection before each request (for serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // Return error for non-health check routes
    if (req.path !== '/health') {
      return res.status(503).json({
        success: false,
        error: 'Database connection unavailable',
        message: 'Please ensure MONGO_URI is configured in environment variables'
      });
    }
    next();
  }
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check route - Updated for v1.1
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: {
      status: dbStates[dbStatus] || 'unknown',
      configured: !!process.env.MONGO_URI
    },
    gemini: {
      configured: !!process.env.GEMINI_API_KEY
    },
    message: !process.env.MONGO_URI ?
      '⚠️ Please add MONGO_URI environment variable in Vercel Dashboard' :
      '✅ All systems configured'
  });
});

// API Routes
app.use('/api', authRoutes);
app.use('/api', itemRoutes);
app.use('/api', noteRoutes);
app.use('/api', diaryNoteRoutes);
app.use('/api', projectRoutes);
app.use('/api', organizationRoutes);
app.use('/api', industryRoutes);
app.use('/api', fileRoutes);

// 404 Handler - Must be after all routes
app.use(notFoundHandler);

// Global Error Handler - Must be last
app.use(errorHandler);

// For Vercel serverless deployment, export the app
// For local development, start the server
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║     SaveIt.AI Backend Server         ║
╠═══════════════════════════════════════╣
║  Server running on port ${PORT}         ║
║  Environment: ${process.env.NODE_ENV || 'development'}           ║
║  API Base: http://localhost:${PORT}/api  ║
╚═══════════════════════════════════════╝
    `);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
  });
}

module.exports = app;

