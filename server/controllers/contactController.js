import mongoose from 'mongoose';
import ContactMessage from '../models/ContactMessage.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendSuccess, sendError, sanitizeXSS } from '../utils/helpers.js';

// @desc    Submit a contact support inquiry
// @route   POST /api/contact
// @access  Public
export const submitContactMessage = async (req, res, next) => {
  try {
    const name = sanitizeXSS(req.body.name || '');
    const email = sanitizeXSS(req.body.email || '').toLowerCase();
    const subject = sanitizeXSS(req.body.subject || '');
    const message = sanitizeXSS(req.body.message || '');

    const errors = [];
    if (!name || name.length < 2) errors.push('Name is required (at least 2 characters)');
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push('A valid email address is required');
    if (!subject || subject.length < 3) errors.push('Subject is required');
    if (!message || message.length < 10) errors.push('Message must be at least 10 characters');

    if (errors.length > 0) {
      return sendError(res, 400, errors[0], errors);
    }

    const created = await ContactMessage.create({
      name,
      email,
      subject,
      message,
      status: 'new'
    });

    // Notify admins non-critically
    try {
      const admins = await User.find({ role: 'admin' }).select('_id').lean();
      if (admins.length > 0) {
        await Notification.insertMany(
          admins.map((adm) => ({
            recipient: adm._id,
            title: 'New Contact Inquiry',
            message: `${name} (${email}) sent inquiry: "${subject}"`,
            type: 'system',
            link: '/dashboard'
          }))
        );
      }
    } catch (notifErr) {
      console.warn('Non-critical contact notification error:', notifErr.message);
    }

    return sendSuccess(res, 201, 'Your inquiry has been submitted successfully', created);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contact inquiries (Admin)
// @route   GET /api/contact
// @access  Private (Admin)
export const getAllContactMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find()
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return sendSuccess(res, 200, 'Contact inquiries retrieved successfully', messages);
  } catch (error) {
    next(error);
  }
};

// @desc    Update contact inquiry status (Admin)
// @route   PATCH /api/contact/:id/status
// @access  Private (Admin)
export const updateContactStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid inquiry ID');
    }

    if (!['new', 'in_progress', 'resolved'].includes(status)) {
      return sendError(res, 400, 'Invalid status. Allowed: new, in_progress, resolved');
    }

    const updated = await ContactMessage.findByIdAndUpdate(
      id,
      { status, reviewedBy: req.user._id },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updated) {
      return sendError(res, 404, 'Contact inquiry not found');
    }

    return sendSuccess(res, 200, `Inquiry marked as ${status}`, updated);
  } catch (error) {
    next(error);
  }
};

