import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/helpers.js';
import { getJwtSecret } from '../config/jwt.js';

export const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

const formatAuthUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  bio: user.bio,
  skills: user.skills,
  resumeUrl: user.resumeUrl,
  companyName: user.companyName,
  location: user.location,
  education: user.education,
  headline: user.headline,
  notificationPreferences: user.notificationPreferences,
  lastLogin: user.lastLogin,
  createdAt: user.createdAt
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, bio, companyName } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return sendError(res, 409, 'An account with this email address already exists');
    }

    // Never allow public registration to self-assign admin role
    const assignedRole = ['candidate', 'recruiter'].includes(role) ? role : 'candidate';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole,
      phone: phone || '',
      bio: bio || '',
      companyName: companyName || '',
      lastLogin: new Date()
    });

    const token = generateToken(user._id, user.role);

    return sendSuccess(res, 201, 'User registered successfully', {
      user: formatAuthUser(user),
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    if (user.isActive === false) {
      return sendError(res, 403, 'Account is disabled. Please contact support.');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password');
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id, user.role);

    return sendSuccess(res, 200, 'Login successful', {
      user: formatAuthUser(user),
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    return sendSuccess(res, 200, 'Current user retrieved successfully', {
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user (clears client session)
// @route   POST /api/auth/logout
// @access  Public / Private
export const logout = async (req, res) => {
  return sendSuccess(res, 200, 'Logged out successfully', null);
};
