const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const logger = require('../utils/logger');

/**
 * Middleware to verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : null;

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required. Please log in.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user still exists
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'The user belonging to this token no longer exists.'
        });
      }

      // Check if user is active
      if (user.status !== 'active') {
        return res.status(403).json({
          status: 'error',
          message: 'Your account is not active. Please contact support.'
        });
      }

      // Add user to request object
      req.user = {
        id: user._id,
        email: user.email,
        role: user.role
      };
      
      next();
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Your session has expired. Please log in again.'
        });
      }
      
      return res.status(401).json({
        status: 'error',
        message: 'Invalid authentication token.'
      });
    }
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during authentication.'
    });
  }
};

/**
 * Middleware to restrict access to specific roles
 * @param {string[]} roles - Array of allowed roles
 * @returns {Function} - Express middleware
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // Verify that user exists in request (from verifyToken middleware)
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required. Please log in.'
      });
    }

    // Check if user's role is allowed
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action.'
      });
    }

    next();
  };
};

/**
 * Middleware to check session timeout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.checkSessionTimeout = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : null;

    if (!token) {
      return next();
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token was issued more than SESSION_TIMEOUT ago
      const tokenIssuedAt = decoded.iat * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const sessionTimeout = eval(process.env.SESSION_TIMEOUT) || 30 * 60 * 1000; // Default: 30 minutes
      
      if (currentTime - tokenIssuedAt > sessionTimeout) {
        return res.status(401).json({
          status: 'error',
          message: 'Session timeout. Please log in again.',
          code: 'SESSION_TIMEOUT'
        });
      }
      
      next();
    } catch (error) {
      // Pass to next middleware if token verification fails
      next();
    }
  } catch (error) {
    logger.error(`Session timeout check error: ${error.message}`);
    next();
  }
};
