import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import Notification from '../models/Notification.js';
import { sendSuccess, sendError, escapeRegExp, escapeCsvCell } from '../utils/helpers.js';

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Candidate)
export const applyForJob = async (req, res, next) => {
  try {
    if (req.user.role !== 'candidate') {
      return sendError(res, 403, 'Only candidate accounts can submit job applications');
    }

    const { jobId, fullName, email, phone, whyInterested, resumeFileName, resumeUrl } = req.body;

    let job = null;
    if (mongoose.Types.ObjectId.isValid(jobId)) {
      job = await Job.findById(jobId);
    }
    if (!job) {
      job = await Job.findOne({ slug: jobId });
    }
    if (!job) {
      return sendError(res, 404, 'The selected job listing does not exist');
    }

    if (job.status === 'closed') {
      return sendError(res, 400, 'This position is currently closed to new applications');
    }

    const existingApplication = await Application.findOne({
      job: job._id,
      applicant: req.user._id
    });

    if (existingApplication) {
      return sendError(res, 409, 'You have already submitted an application for this position');
    }

    const application = await Application.create({
      job: job._id,
      applicant: req.user._id,
      fullName: fullName || req.user.name,
      email: email || req.user.email,
      phone: phone || req.user.phone || '',
      whyInterested: whyInterested || '',
      resumeFileName: resumeFileName || (req.user.resumeUrl ? 'Profile-Resume.pdf' : 'resume.pdf'),
      resumeUrl: resumeUrl || req.user.resumeUrl || ''
    });

    await Job.findByIdAndUpdate(job._id, { $inc: { applicantsCount: 1 } });

    if (job.postedBy && job.postedBy.toString() !== req.user._id.toString()) {
      try {
        await Notification.create({
          recipient: job.postedBy,
          sender: req.user._id,
          title: 'New Application Received',
          message: `${fullName || req.user.name} applied for "${job.title}"`,
          type: 'application_received',
          link: '/dashboard'
        });
      } catch (notifErr) {
        console.warn('Non-critical notification creation error:', notifErr.message);
      }
    }

    const populatedApp = await Application.findById(application._id)
      .populate('job', 'title company location workType stipend status slug')
      .populate('applicant', 'name email role phone headline education');

    return sendSuccess(res, 201, 'Application submitted successfully', populatedApp);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's submitted applications
// @route   GET /api/applications/my
// @access  Private (Authenticated User)
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title company location workType category duration stipend status deadline slug')
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, 200, 'Applications retrieved successfully', applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all platform applications (Admin Monitor)
// @route   GET /api/applications/admin
// @access  Private (Admin)
export const getAllApplicationsAdmin = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (status && status !== 'all' && status !== 'All') {
      filter.status = status.toLowerCase();
    }

    if (search && search.trim()) {
      const sRegex = new RegExp(escapeRegExp(search.trim()), 'i');
      filter.$or = [
        { fullName: sRegex },
        { email: sRegex },
        { phone: sRegex }
      ];
    }

    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (safePage - 1) * safeLimit;

    const total = await Application.countDocuments(filter);
    const applications = await Application.find(filter)
      .populate('job', 'title company workType location stipend status slug')
      .populate('applicant', 'name email phone skills bio headline education resumeUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean();

    return sendSuccess(res, 200, 'Platform applications retrieved successfully', applications, {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications for jobs posted by the recruiter (or all for admin)
// @route   GET /api/applications/recruiter
// @access  Private (Recruiter / Admin)
export const getRecruiterApplications = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const jobFilter = isAdmin ? {} : { postedBy: req.user._id };

    const jobs = await Job.find(jobFilter)
      .select('_id title company workType location openings stipend applicantsCount status createdAt slug')
      .sort({ createdAt: -1 })
      .lean();

    const jobIds = jobs.map((j) => j._id);
    const jobIdStrings = new Set(jobIds.map((id) => id.toString()));

    const appFilter = { job: { $in: jobIds } };
    const { jobId, status, search } = req.query;

    if (jobId) {
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return sendError(res, 400, 'Invalid jobId filter');
      }
      if (!isAdmin && !jobIdStrings.has(String(jobId))) {
        return sendError(res, 403, 'Access denied: you can only view applications for your own job postings');
      }
      appFilter.job = jobId;
    }

    if (status && status !== 'All' && status !== 'all') {
      appFilter.status = status.toLowerCase();
    }

    if (search && search.trim()) {
      const sRegex = new RegExp(escapeRegExp(search.trim()), 'i');
      appFilter.$or = [
        { fullName: sRegex },
        { email: sRegex },
        { phone: sRegex }
      ];
    }

    const applications = await Application.find(appFilter)
      .populate('job', 'title company workType location stipend status slug')
      .populate('applicant', 'name email phone skills bio headline education location resumeUrl')
      .sort({ createdAt: -1 })
      .lean();

    const allAppsForJobs = await Application.find({ job: { $in: jobIds } }).select('status').lean();
    const stats = {
      total: allAppsForJobs.length,
      pending: allAppsForJobs.filter((a) => a.status === 'pending').length,
      shortlisted: allAppsForJobs.filter((a) => a.status === 'shortlisted' || a.status === 'reviewed').length,
      accepted: allAppsForJobs.filter((a) => a.status === 'accepted').length,
      rejected: allAppsForJobs.filter((a) => a.status === 'rejected').length
    };

    return sendSuccess(res, 200, 'Recruiter applications retrieved successfully', {
      jobs,
      applications,
      stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application details
// @route   GET /api/applications/:id
// @access  Private (Applicant, Job Poster, or Admin)
export const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid application ID');
    }

    const application = await Application.findById(id)
      .populate('job', 'title company location workType duration stipend postedBy status slug')
      .populate('applicant', 'name email phone skills bio headline education location resumeUrl');

    if (!application) {
      return sendError(res, 404, 'Application not found');
    }

    const isApplicant = application.applicant._id.toString() === req.user._id.toString();
    const isJobPoster = application.job && application.job.postedBy && application.job.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isApplicant && !isJobPoster && !isAdmin) {
      return sendError(res, 403, 'Access denied: you cannot view this application');
    }

    return sendSuccess(res, 200, 'Application retrieved successfully', application);
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status & review notes
// @route   PUT /api/applications/:id/status
// @access  Private (Owner Recruiter or Admin)
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid application ID');
    }

    const application = await Application.findById(id).populate('job');
    if (!application) {
      return sendError(res, 404, 'Application not found');
    }

    const isJobPoster = application.job && application.job.postedBy && application.job.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isJobPoster && !isAdmin) {
      return sendError(res, 403, 'Access denied: only the job recruiter or admin can update application status');
    }

    application.status = status;
    if (notes !== undefined) application.notes = String(notes).trim();
    application.reviewedBy = req.user._id;
    await application.save();

    try {
      const statusTitle = status.charAt(0).toUpperCase() + status.slice(1);
      await Notification.create({
        recipient: application.applicant,
        sender: req.user._id,
        title: 'Application Status Updated',
        message: `Your application for "${application.job?.title || 'Internship'}" has been marked as ${statusTitle}.`,
        type: 'status_updated',
        link: '/applications'
      });
    } catch (notifErr) {
      console.warn('Non-critical notification error:', notifErr.message);
    }

    return sendSuccess(res, 200, `Application status updated to ${status}`, application);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete / withdraw application
// @route   DELETE /api/applications/:id
// @access  Private (Applicant, Job Poster, or Admin)
export const deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid application ID');
    }

    const application = await Application.findById(id).populate('job');
    if (!application) {
      return sendError(res, 404, 'Application not found');
    }

    const isApplicant = application.applicant.toString() === req.user._id.toString();
    const isJobPoster = application.job && application.job.postedBy && application.job.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isApplicant && !isJobPoster && !isAdmin) {
      return sendError(res, 403, 'Access denied: not authorized to delete this application');
    }

    await Application.findByIdAndDelete(id);

    if (application.job) {
      const safeCount = Math.max(0, (application.job.applicantsCount || 0) - 1);
      await Job.findByIdAndUpdate(application.job._id, { applicantsCount: safeCount });
    }

    return sendSuccess(res, 200, 'Application removed successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Export applications as CSV (Recruiter own jobs / Admin all)
// @route   GET /api/applications/export/csv
// @access  Private (Recruiter, Admin)
export const exportApplicationsCSV = async (req, res, next) => {
  try {
    const isRecruiter = req.user.role === 'recruiter';
    const isAdmin = req.user.role === 'admin';

    if (!isRecruiter && !isAdmin) {
      return sendError(res, 403, 'Access denied: CSV export is only available to recruiters and administrators');
    }

    const jobFilter = isRecruiter ? { postedBy: req.user._id } : {};
    const jobs = await Job.find(jobFilter).select('_id').lean();
    const jobIds = jobs.map((j) => j._id);

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('job', 'title company workType location stipend')
      .populate('applicant', 'name email phone skills')
      .sort({ createdAt: -1 })
      .lean();

    const headers = [
      'Application ID',
      'Candidate Name',
      'Candidate Email',
      'Candidate Phone',
      'Job Title',
      'Company',
      'Work Mode',
      'Stipend',
      'Application Status',
      'Applied Date',
      'Resume File'
    ];

    const rows = applications.map((app) => [
      escapeCsvCell(app._id),
      escapeCsvCell(app.fullName || app.applicant?.name || 'N/A'),
      escapeCsvCell(app.email || app.applicant?.email || 'N/A'),
      escapeCsvCell(app.phone || app.applicant?.phone || 'N/A'),
      escapeCsvCell(app.job?.title || 'N/A'),
      escapeCsvCell(app.job?.company || 'N/A'),
      escapeCsvCell(app.job?.workType || 'N/A'),
      escapeCsvCell(app.job?.stipend || 'N/A'),
      escapeCsvCell(app.status?.toUpperCase() || 'PENDING'),
      escapeCsvCell(new Date(app.createdAt).toISOString().split('T')[0]),
      escapeCsvCell(app.resumeFileName || 'resume.pdf')
    ]);

    const csvContent = [headers.map(escapeCsvCell).join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="dg-interns-applications.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
