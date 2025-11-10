/**
 * Request validation middleware
 * Validates and sanitizes incoming requests
 */

// Validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Sanitize string input (remove potentially dangerous characters)
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  // Remove null bytes and trim
  return str.replace(/\0/g, '').trim();
};

// Validate request body size
const validateBodySize = (req, res, next) => {
  const contentLength = req.headers['content-length'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength && parseInt(contentLength) > maxSize) {
    return res.status(413).json({
      success: false,
      error: 'Request body too large',
      maxSize: '10MB'
    });
  }

  next();
};

// Validate JSON payload
const validateJSON = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.headers['content-type'];

    if (contentType && contentType.includes('application/json')) {
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Request body is required'
        });
      }
    }
  }

  next();
};

// Rate limiting store (in-memory, for serverless use external service like Redis)
const requestCounts = new Map();

// Simple rate limiter
const rateLimiter = (maxRequests = 100, windowMs = 60000) => {
  return (req, res, next) => {
    const identifier = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create request log for this identifier
    if (!requestCounts.has(identifier)) {
      requestCounts.set(identifier, []);
    }

    const requests = requestCounts.get(identifier);

    // Remove old requests outside the window
    const recentRequests = requests.filter(timestamp => timestamp > windowStart);
    requestCounts.set(identifier, recentRequests);

    // Check if limit exceeded
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
      });
    }

    // Add current request
    recentRequests.push(now);
    next();
  };
};

// Clean up old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;

  for (const [identifier, requests] of requestCounts.entries()) {
    const recentRequests = requests.filter(timestamp => timestamp > fiveMinutesAgo);

    if (recentRequests.length === 0) {
      requestCounts.delete(identifier);
    } else {
      requestCounts.set(identifier, recentRequests);
    }
  }
}, 5 * 60 * 1000);

module.exports = {
  isValidObjectId,
  sanitizeString,
  validateBodySize,
  validateJSON,
  rateLimiter
};
