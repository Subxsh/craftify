const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Temporary in-memory storage access (in production, this would be from database)
const getUserById = (id) => {
  // This will be replaced with database query in production
  if (global.tempUsers) {
    return global.tempUsers.find(user => user._id === parseInt(id));
  }
  return null;
};

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from DB
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid. User not found.'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated.'
        });
      }

      if (user.isLocked) {
        return res.status(401).json({
          success: false,
          message: 'Account is temporarily locked due to multiple failed login attempts.'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid.'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please login first.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${req.user.role} role is not authorized to access this resource.`
      });
    }

    next();
  };
};

// Optional auth - doesn't require token but adds user if present
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.isActive && !user.isLocked) {
          req.user = user;
        }
      } catch (error) {
        // Token invalid, but continue without user
        console.log('Optional auth: Invalid token');
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

// Check if user owns resource or is admin
const ownerOrAdmin = (resourceUserField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please login first.'
      });
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    if (req.resource && req.resource[resourceUserField]) {
      if (req.resource[resourceUserField].toString() === req.user._id.toString()) {
        return next();
      }
    }

    // Check if user ID in params matches current user
    if (req.params.userId && req.params.userId === req.user._id.toString()) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources.'
    });
  };
};

// Seller verification check
const verifiedSeller = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please login first.'
    });
  }

  if (req.user.role !== 'seller' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Seller account required.'
    });
  }

  if (req.user.role === 'seller' && !req.user.sellerProfile?.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Seller account must be verified.'
    });
  }

  next();
};

// Rate limiting for sensitive operations
const sensitiveOpLimit = (req, res, next) => {
  // This would typically use Redis for production
  // For now, we'll use a simple in-memory store
  const key = `${req.ip}-${req.user?._id || 'anonymous'}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  if (!global.sensitiveOpStore) {
    global.sensitiveOpStore = new Map();
  }

  const attempts = global.sensitiveOpStore.get(key) || [];
  const recentAttempts = attempts.filter(time => now - time < windowMs);

  if (recentAttempts.length >= maxAttempts) {
    return res.status(429).json({
      success: false,
      message: 'Too many attempts. Please try again later.'
    });
  }

  recentAttempts.push(now);
  global.sensitiveOpStore.set(key, recentAttempts);

  next();
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
  ownerOrAdmin,
  verifiedSeller,
  sensitiveOpLimit
};
