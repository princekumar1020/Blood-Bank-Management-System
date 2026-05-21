import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const updateActivity = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded?.user?.id;
    if (userId) {
      await User.findByIdAndUpdate(userId, { lastActiveAt: new Date() }).exec();
      req.user = decoded.user;
    }
  } catch (error) {
    // Ignore invalid token; presence tracking is optional.
  }
  return next();
};

export default updateActivity;
