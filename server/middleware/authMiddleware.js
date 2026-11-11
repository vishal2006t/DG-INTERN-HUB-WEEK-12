import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendError } from '../utils/helpers.js';
import { getJwtSecret } from '../config/jwt.js';

export const authenticateUser = async (req, res, next) => {
  let token;

  // Check Authorization header for Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return sendError(res, 401, 'Authentication required');
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return sendError(res, 401, 'User no longer exists');
    }

    if (user.isActive === false) {
      return sendError(res, 403, 'Your account has been deactivated. Contact support.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Session expired, please log in again');
    }
    return sendError(res, 401, 'Invalid authentication token');
  }
};

export const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id).select('-password');
    if (user && user.isActive !== false) {
      req.user = user;
    }
  } catch {
    // Ignore invalid token in optional auth
  }

  next();
};
