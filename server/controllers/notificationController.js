import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import { sendSuccess, sendError } from '../utils/helpers.js';

// @desc    Get notifications for the logged in user
// @route   GET /api/notifications
// @access  Private (Authenticated)
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('sender', 'name email companyName role')
      .lean();

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    return sendSuccess(res, 200, 'Notifications retrieved successfully', {
      notifications,
      unreadCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private (Authenticated)
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid notification ID');
    }

    const notification = await Notification.findOne({
      _id: id,
      recipient: req.user._id
    });

    if (!notification) {
      return sendError(res, 404, 'Notification not found');
    }

    notification.isRead = true;
    await notification.save();

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    return sendSuccess(res, 200, 'Notification marked as read', {
      notification,
      unreadCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read for current user
// @route   PUT /api/notifications/read-all
// @access  Private (Authenticated)
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    return sendSuccess(res, 200, 'All notifications marked as read', {
      unreadCount: 0
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a notification belonging to current user
// @route   DELETE /api/notifications/:id
// @access  Private (Owner)
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid notification ID');
    }

    const deleted = await Notification.findOneAndDelete({
      _id: id,
      recipient: req.user._id
    });

    if (!deleted) {
      return sendError(res, 404, 'Notification not found');
    }

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    return sendSuccess(res, 200, 'Notification deleted', {
      unreadCount
    });
  } catch (error) {
    next(error);
  }
};
