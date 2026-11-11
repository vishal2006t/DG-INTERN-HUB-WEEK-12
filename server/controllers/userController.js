import mongoose from 'mongoose';
import User from '../models/User.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { sendSuccess, sendError, escapeRegExp } from '../utils/helpers.js';

// @desc    Get current user's profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return sendError(res, 404, 'User profile not found');
    }

    return sendSuccess(res, 200, 'Profile fetched successfully', {
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user's profile & settings
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return sendError(res, 404, 'User profile not found');
    }

    const {
      name,
      phone,
      bio,
      skills,
      resumeUrl,
      companyName,
      location,
      education,
      headline,
      notificationPreferences,
      currentPassword,
      newPassword
    } = req.body;

    if (name && typeof name === 'string') user.name = name.trim();
    if (phone !== undefined) user.phone = String(phone).trim();
    if (bio !== undefined) user.bio = String(bio).trim();
    if (skills !== undefined) {
      user.skills = Array.isArray(skills)
        ? skills.map((s) => String(s).trim()).filter(Boolean)
        : String(skills).split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (resumeUrl !== undefined) user.resumeUrl = String(resumeUrl).trim();
    if (companyName !== undefined) user.companyName = String(companyName).trim();
    if (location !== undefined) user.location = String(location).trim();
    if (education !== undefined) user.education = String(education).trim();
    if (headline !== undefined) user.headline = String(headline).trim();

    if (notificationPreferences && typeof notificationPreferences === 'object') {
      user.notificationPreferences = {
        emailUpdates:
          notificationPreferences.emailUpdates !== undefined
            ? Boolean(notificationPreferences.emailUpdates)
            : user.notificationPreferences?.emailUpdates ?? true,
        applicationAlerts:
          notificationPreferences.applicationAlerts !== undefined
            ? Boolean(notificationPreferences.applicationAlerts)
            : user.notificationPreferences?.applicationAlerts ?? true,
        jobRecommendations:
          notificationPreferences.jobRecommendations !== undefined
            ? Boolean(notificationPreferences.jobRecommendations)
            : user.notificationPreferences?.jobRecommendations ?? true
      };
    }

    if (newPassword) {
      if (!currentPassword) {
        return sendError(res, 400, 'Current password is required to set a new password');
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return sendError(res, 400, 'Current password does not match');
      }
      if (newPassword.length < 6) {
        return sendError(res, 400, 'New password must be at least 6 characters');
      }
      user.password = newPassword;
    }

    const updatedUser = await user.save();

    return sendSuccess(res, 200, 'Profile updated successfully', {
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        bio: updatedUser.bio,
        skills: updatedUser.skills,
        resumeUrl: updatedUser.resumeUrl,
        companyName: updatedUser.companyName,
        location: updatedUser.location,
        education: updatedUser.education,
        headline: updatedUser.headline,
        notificationPreferences: updatedUser.notificationPreferences,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete own profile
// @route   DELETE /api/users/profile
// @access  Private
export const deleteProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    await Application.deleteMany({ applicant: user._id });

    if (user.role === 'recruiter') {
      const recruiterJobs = await Job.find({ postedBy: user._id }).select('_id');
      const jobIds = recruiterJobs.map((j) => j._id);
      if (jobIds.length > 0) {
        await Application.deleteMany({ job: { $in: jobIds } });
      }
      await Job.deleteMany({ postedBy: user._id });
    }

    await User.findByIdAndDelete(user._id);

    return sendSuccess(res, 200, 'User profile and related records deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private (Admin)
export const getAllUsersAdmin = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (typeof role === 'string' && role !== 'All' && ['candidate', 'recruiter', 'admin'].includes(role)) {
      query.role = role;
    }

    if (typeof search === 'string' && search.trim()) {
      const sRegex = new RegExp(escapeRegExp(search.trim()), 'i');
      query.$or = [
        { name: sRegex },
        { email: sRegex },
        { companyName: sRegex }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * safeLimit;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean();

    return sendSuccess(res, 200, 'Users retrieved successfully', {
      users,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
      page: pageNum,
      limit: safeLimit
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (Admin)
// @route   PUT /api/users/:id/role
// @access  Private (Admin)
export const updateUserRoleAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid user ID');
    }

    if (!['candidate', 'recruiter', 'admin'].includes(role)) {
      return sendError(res, 400, 'Invalid role specified');
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return sendError(res, 404, 'User not found');
    }

    if (targetUser.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return sendError(res, 400, 'Cannot demote the sole system administrator');
      }
    }

    targetUser.role = role;
    await targetUser.save();

    return sendSuccess(res, 200, `User role updated to ${role}`, {
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user by ID (Admin)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
export const deleteUserAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid user ID');
    }

    if (id === req.user._id.toString()) {
      return sendError(res, 400, 'Administrators cannot delete their own active account from the admin panel');
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return sendError(res, 404, 'User not found');
    }

    if (targetUser.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return sendError(res, 400, 'Cannot delete the sole system administrator');
      }
    }

    await Application.deleteMany({ applicant: targetUser._id });

    if (targetUser.role === 'recruiter') {
      const recruiterJobs = await Job.find({ postedBy: targetUser._id }).select('_id');
      const jobIds = recruiterJobs.map((j) => j._id);
      if (jobIds.length > 0) {
        await Application.deleteMany({ job: { $in: jobIds } });
      }
      await Job.deleteMany({ postedBy: targetUser._id });
    }

    await User.findByIdAndDelete(id);

    return sendSuccess(res, 200, 'User and associated records removed successfully');
  } catch (error) {
    next(error);
  }
};
