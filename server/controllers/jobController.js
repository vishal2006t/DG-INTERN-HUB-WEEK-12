import mongoose from 'mongoose';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { sendSuccess, sendError, escapeRegExp } from '../utils/helpers.js';

const ALLOWED_JOB_UPDATE_FIELDS = [
  'title',
  'company',
  'location',
  'workType',
  'type',
  'category',
  'duration',
  'stipend',
  'stipendAmount',
  'skills',
  'description',
  'shortDescription',
  'about',
  'responsibilities',
  'requirements',
  'whoCanApply',
  'learning',
  'benefits',
  'openings',
  'featured',
  'deadline',
  'status',
  'experienceLevel'
];

const parseSkills = (skills) => {
  if (Array.isArray(skills)) {
    return skills.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof skills === 'string') {
    return skills.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

// @desc    Get dynamic filter facets from open jobs
// @route   GET /api/jobs/filters
// @access  Public
export const getJobFilters = async (req, res, next) => {
  try {
    const [categories, locations, workTypes, types, experienceLevels] = await Promise.all([
      Job.distinct('category', { status: 'open' }),
      Job.distinct('location', { status: 'open' }),
      Job.distinct('workType', { status: 'open' }),
      Job.distinct('type', { status: 'open' }),
      Job.distinct('experienceLevel', { status: 'open' })
    ]);

    return sendSuccess(res, 200, 'Job filter facets retrieved successfully', {
      categories: categories.filter(Boolean).sort(),
      locations: locations.filter(Boolean).sort(),
      workTypes: workTypes.filter(Boolean),
      types: types.filter(Boolean),
      experienceLevels: experienceLevels.filter(Boolean)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs with filtering, search, pagination, and sorting
// @route   GET /api/jobs
// @access  Public (Optional Auth for owner/admin multi-status view)
export const getJobs = async (req, res, next) => {
  try {
    const {
      search,
      category,
      workType,
      type,
      location,
      experience,
      featured,
      status,
      postedBy,
      includeAllStatuses,
      sort = '-createdAt',
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    const canViewAllStatuses =
      includeAllStatuses === 'true' &&
      req.user &&
      (req.user.role === 'admin' ||
        (req.user.role === 'recruiter' && postedBy && String(postedBy) === String(req.user._id)));

    if (!canViewAllStatuses) {
      query.status = status && ['open', 'closed', 'draft'].includes(status) && req.user?.role === 'admin'
        ? status
        : 'open';
    } else if (status && ['open', 'closed', 'draft'].includes(status)) {
      query.status = status;
    }

    if (category && category !== 'All Categories' && category !== 'All') {
      query.category = new RegExp(`^${escapeRegExp(category)}$`, 'i');
    }

    if (workType && workType !== 'All' && workType !== 'All Modes') {
      query.workType = new RegExp(`^${escapeRegExp(workType)}$`, 'i');
    }

    const normalizedType = typeof type === 'string' ? type.toLowerCase() : '';
    if (normalizedType && normalizedType !== 'all' && ['internship', 'full-time', 'part-time', 'contract'].includes(normalizedType)) {
      query.type = normalizedType;
    }

    if (typeof experience === 'string' && experience !== 'All Experience' && experience !== 'all' && ['Fresher', '0-1 Years', '1-3 Years', '3+ Years'].includes(experience)) {
      query.experienceLevel = experience;
    }

    if (typeof location === 'string' && location !== 'all' && location !== 'All Locations') {
      query.location = new RegExp(escapeRegExp(location), 'i');
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (typeof postedBy === 'string' && mongoose.Types.ObjectId.isValid(postedBy)) {
      query.postedBy = postedBy;
    }

    if (typeof search === 'string' && search.trim()) {
      const safeRegex = new RegExp(escapeRegExp(search.trim()), 'i');
      query.$or = [
        { title: safeRegex },
        { company: safeRegex },
        { location: safeRegex },
        { workType: safeRegex },
        { description: safeRegex },
        { category: safeRegex },
        { skills: safeRegex }
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'oldest' || sort === 'createdAt') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'deadline') {
      sortOptions = { deadline: 1 };
    } else if (sort === 'stipend-high' || sort === 'stipend' || sort === '-stipendAmount') {
      sortOptions = { stipendAmount: -1, createdAt: -1 };
    } else if (sort === '-applicantsCount') {
      sortOptions = { applicantsCount: -1, createdAt: -1 };
    } else if (sort === 'newest' || sort === '-createdAt') {
      sortOptions = { createdAt: -1 };
    }

    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (safePage - 1) * safeLimit;

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(safeLimit)
      .populate('postedBy', 'name email companyName role')
      .lean();

    const totalPages = Math.max(1, Math.ceil(total / safeLimit));

    return sendSuccess(res, 200, 'Jobs retrieved successfully', jobs, {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ObjectId or slug
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let job = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      job = await Job.findById(id).populate('postedBy', 'name email companyName role');
    }

    if (!job) {
      job = await Job.findOne({ slug: id }).populate('postedBy', 'name email companyName role');
    }

    if (!job) {
      return sendError(res, 404, 'Internship listing not found');
    }

    return sendSuccess(res, 200, 'Job retrieved successfully', job);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new job listing
// @route   POST /api/jobs
// @access  Private (Recruiter / Admin)
export const createJob = async (req, res, next) => {
  try {
    const body = req.body;
    const processedSkills = parseSkills(body.skills);

    const parsedStipendAmount =
      body.stipendAmount !== undefined && !Number.isNaN(Number(body.stipendAmount))
        ? Number(body.stipendAmount)
        : Number(String(body.stipend || '').replace(/[^0-9]/g, '')) || 15000;

    const jobData = {
      title: body.title.trim(),
      company: body.company.trim(),
      location: body.location.trim(),
      workType: body.workType || 'Remote',
      type: body.type || 'internship',
      category: body.category || 'Web Development',
      duration: body.duration || '3 Months',
      stipend: body.stipend || '₹15,000 / month',
      stipendAmount: parsedStipendAmount,
      skills: processedSkills,
      description: body.description.trim(),
      shortDescription: body.shortDescription || body.description.substring(0, 140),
      about: body.about || body.description,
      responsibilities: Array.isArray(body.responsibilities) ? body.responsibilities : [],
      requirements: Array.isArray(body.requirements) ? body.requirements : [],
      whoCanApply: body.whoCanApply || '',
      learning: Array.isArray(body.learning) ? body.learning : [],
      benefits: Array.isArray(body.benefits) ? body.benefits : [],
      openings: Math.max(1, Number(body.openings) || 2),
      featured: Boolean(body.featured),
      experienceLevel: body.experienceLevel || 'Fresher',
      status: body.status && ['open', 'closed', 'draft'].includes(body.status) ? body.status : 'open',
      postedBy: req.user._id
    };

    if (body.deadline) {
      jobData.deadline = new Date(body.deadline);
    }

    const baseSlug = `${body.title}-${body.company}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    jobData.slug = `${baseSlug}-${Date.now().toString(36)}`;

    const newJob = await Job.create(jobData);
    return sendSuccess(res, 201, 'Job created successfully', newJob);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job listing (whitelisted fields + strict owner/admin check)
// @route   PUT /api/jobs/:id
// @access  Private (Owner Recruiter / Admin)
export const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = mongoose.Types.ObjectId.isValid(id)
      ? await Job.findById(id)
      : await Job.findOne({ slug: id });

    if (!job) {
      return sendError(res, 404, 'Internship listing not found');
    }

    if (
      req.user.role !== 'admin' &&
      job.postedBy &&
      job.postedBy.toString() !== req.user._id.toString()
    ) {
      return sendError(res, 403, 'Not authorized to modify this job posting');
    }

    const updates = {};
    for (const key of ALLOWED_JOB_UPDATE_FIELDS) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (updates.skills !== undefined) {
      updates.skills = parseSkills(updates.skills);
    }

    const updatedJob = await Job.findByIdAndUpdate(job._id, updates, {
      returnDocument: 'after',
      runValidators: true
    }).populate('postedBy', 'name email companyName role');

    return sendSuccess(res, 200, 'Job updated successfully', updatedJob);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job listing and its linked applications
// @route   DELETE /api/jobs/:id
// @access  Private (Owner Recruiter / Admin)
export const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = mongoose.Types.ObjectId.isValid(id)
      ? await Job.findById(id)
      : await Job.findOne({ slug: id });

    if (!job) {
      return sendError(res, 404, 'Internship listing not found');
    }

    if (
      req.user.role !== 'admin' &&
      job.postedBy &&
      job.postedBy.toString() !== req.user._id.toString()
    ) {
      return sendError(res, 403, 'Not authorized to delete this job posting');
    }

    await Application.deleteMany({ job: job._id });
    await Job.findByIdAndDelete(job._id);

    return sendSuccess(res, 200, 'Job deleted successfully', null);
  } catch (error) {
    next(error);
  }
};
