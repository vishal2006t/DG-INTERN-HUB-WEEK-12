import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import ContactMessage from '../models/ContactMessage.js';
import { getConnectionStatus } from '../config/database.js';
import { sendSuccess } from '../utils/helpers.js';

// @desc    Get live public platform statistics (Homepage cards)
// @route   GET /api/analytics/public
// @access  Public
export const getPublicStats = async (req, res, next) => {
  try {
    const [
      activeInternships,
      registeredCandidates,
      distinctCompanies,
      applicationsProcessed
    ] = await Promise.all([
      Job.countDocuments({ status: 'open' }),
      User.countDocuments({ role: 'candidate' }),
      Job.distinct('company', { status: 'open' }),
      Application.countDocuments()
    ]);

    return sendSuccess(res, 200, 'Public platform metrics retrieved successfully', {
      activeInternships,
      registeredCandidates,
      partnerCompanies: distinctCompanies.filter(Boolean).length,
      applicationsProcessed
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get global platform statistics & analytics (Admin)
// @route   GET /api/analytics/admin
// @access  Private (Admin)
export const getAdminAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      candidatesCount,
      recruitersCount,
      adminsCount,
      totalJobs,
      openJobs,
      closedJobs,
      totalApplications,
      pendingApps,
      reviewedApps,
      shortlistedApps,
      acceptedApps,
      rejectedApps,
      totalInquiries,
      openInquiries,
      categoryBreakdown,
      workTypeBreakdown,
      recentUsers,
      recentApplications
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'candidate' }),
      User.countDocuments({ role: 'recruiter' }),
      User.countDocuments({ role: 'admin' }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'open' }),
      Job.countDocuments({ status: 'closed' }),
      Application.countDocuments(),
      Application.countDocuments({ status: 'pending' }),
      Application.countDocuments({ status: 'reviewed' }),
      Application.countDocuments({ status: 'shortlisted' }),
      Application.countDocuments({ status: 'accepted' }),
      Application.countDocuments({ status: 'rejected' }),
      ContactMessage.countDocuments(),
      ContactMessage.countDocuments({ status: { $ne: 'resolved' } }),
      Job.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Job.aggregate([
        { $group: { _id: '$workType', count: { $sum: 1 } } }
      ]),
      User.find().select('name email role createdAt companyName').sort({ createdAt: -1 }).limit(5).lean(),
      Application.find()
        .populate('job', 'title company')
        .populate('applicant', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    const dbHealth = getConnectionStatus();

    return sendSuccess(res, 200, 'Admin platform analytics retrieved successfully', {
      users: {
        total: totalUsers,
        candidates: candidatesCount,
        recruiters: recruitersCount,
        admins: adminsCount
      },
      jobs: {
        total: totalJobs,
        open: openJobs,
        closed: closedJobs,
        byCategory: categoryBreakdown.map((c) => ({ category: c._id || 'Unassigned', count: c.count })),
        byWorkType: workTypeBreakdown.map((w) => ({ workType: w._id || 'Remote', count: w.count }))
      },
      applications: {
        total: totalApplications,
        pending: pendingApps,
        reviewed: reviewedApps,
        shortlisted: shortlistedApps + reviewedApps,
        shortlistedExact: shortlistedApps,
        accepted: acceptedApps,
        rejected: rejectedApps
      },
      inquiries: {
        total: totalInquiries,
        open: openInquiries
      },
      recentActivity: {
        users: recentUsers,
        applications: recentApplications
      },
      system: {
        databaseConnected: dbHealth.isConnected,
        databaseHost: dbHealth.host,
        environment: process.env.NODE_ENV || 'development',
        serverUptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recruiter-specific statistics
// @route   GET /api/analytics/recruiter
// @access  Private (Recruiter / Admin)
export const getRecruiterAnalytics = async (req, res, next) => {
  try {
    const jobFilter = req.user.role === 'admin' ? {} : { postedBy: req.user._id };
    const jobs = await Job.find(jobFilter).select('_id status applicantsCount title').lean();
    const jobIds = jobs.map((j) => j._id);

    const [
      totalApplications,
      pendingApps,
      shortlistedApps,
      acceptedApps,
      rejectedApps
    ] = await Promise.all([
      Application.countDocuments({ job: { $in: jobIds } }),
      Application.countDocuments({ job: { $in: jobIds }, status: 'pending' }),
      Application.countDocuments({ job: { $in: jobIds }, status: { $in: ['shortlisted', 'reviewed'] } }),
      Application.countDocuments({ job: { $in: jobIds }, status: 'accepted' }),
      Application.countDocuments({ job: { $in: jobIds }, status: 'rejected' })
    ]);

    return sendSuccess(res, 200, 'Recruiter analytics retrieved successfully', {
      totalJobs: jobs.length,
      activeJobs: jobs.filter((j) => j.status === 'open').length,
      closedJobs: jobs.filter((j) => j.status === 'closed').length,
      applications: {
        total: totalApplications,
        pending: pendingApps,
        shortlisted: shortlistedApps,
        accepted: acceptedApps,
        rejected: rejectedApps
      }
    });
  } catch (error) {
    next(error);
  }
};
