const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  // Check if MONGO_URI exists
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI environment variable is not set!');
    console.error('Please add MONGO_URI in Vercel Dashboard -> Settings -> Environment Variables');
    throw new Error('MONGO_URI is required');
  }

  // Use cached connection if available (important for serverless)
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('✅ Using cached MongoDB connection');
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10s timeout
      socketTimeoutMS: 45000, // 45s socket timeout
      maxPoolSize: 10, // Maximum connection pool size
      minPoolSize: 1, // Minimum connection pool size
      retryWrites: true,
      retryReads: true,
    });

    cachedConnection = conn;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Will reconnect on next request.');
      cachedConnection = null;
    });

    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    cachedConnection = null;
    // Don't exit in serverless environment, just throw error
    throw error;
  }
};

module.exports = connectDB;
