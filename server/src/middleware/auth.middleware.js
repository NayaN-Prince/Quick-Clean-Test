const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - Verify the token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (Format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token and attach to request
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Move to the next function (controller)
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Grant access to specific roles (e.g., only 'worker')
const workerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'worker') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Workers only.' });
  }
};

module.exports = { protect, workerOnly };