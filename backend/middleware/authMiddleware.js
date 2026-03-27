const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Check for token in headers
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    // Check if req.user was already set by development bypass in server.js
    if (req.user && req.user._id) {
        return next();
    }
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
