import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Update last activity
    user.lastActivity = new Date();
    await user.save();

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const checkSessionTimeout = async (req, res, next) => {
  if (!req.user) {
    return next();
  }

  const timeoutMinutes = parseInt(process.env.SESSION_TIMEOUT) || 30;
  const lastActivity = new Date(req.user.lastActivity);
  const now = new Date();
  const minutesSinceActivity = (now - lastActivity) / (1000 * 60);

  if (minutesSinceActivity > timeoutMinutes) {
    return res.status(401).json({ error: 'Session expired. Please login again.' });
  }

  next();
};
