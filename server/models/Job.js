import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      default: 'Remote'
    },
    workType: {
      type: String,
      enum: {
        values: ['Remote', 'Hybrid', 'On-site'],
        message: '{VALUE} is not a valid work type'
      },
      default: 'Remote'
    },
    type: {
      type: String,
      enum: ['internship', 'full-time', 'part-time', 'contract'],
      default: 'internship'
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'Web Development'
    },
    duration: {
      type: String,
      default: '3 Months'
    },
    stipend: {
      type: String,
      default: '₹15,000 / month'
    },
    stipendAmount: {
      type: Number,
      default: 15000
    },
    skills: {
      type: [String],
      required: [true, 'At least one skill is required'],
      default: []
    },
    description: {
      type: String,
      required: [true, 'Job description is required']
    },
    shortDescription: {
      type: String,
      default: ''
    },
    about: {
      type: String,
      default: ''
    },
    responsibilities: {
      type: [String],
      default: []
    },
    requirements: {
      type: [String],
      default: []
    },
    whoCanApply: {
      type: [String],
      default: []
    },
    learning: {
      type: [String],
      default: []
    },
    benefits: {
      type: [String],
      default: []
    },
    openings: {
      type: Number,
      default: 1,
      min: [1, 'Openings must be at least 1']
    },
    applicantsCount: {
      type: Number,
      default: 0
    },
    featured: {
      type: Boolean,
      default: false
    },
    deadline: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Job creator reference is required']
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'draft'],
      default: 'open'
    },
    experienceLevel: {
      type: String,
      enum: ['Fresher', '0-1 Years', '1-3 Years', '3+ Years'],
      default: 'Fresher'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for fast searching and filtering
jobSchema.index({ title: 'text', company: 'text', description: 'text', skills: 'text' });
jobSchema.index({ category: 1, workType: 1, createdAt: -1 });
jobSchema.index({ type: 1, location: 1 });
jobSchema.index({ deadline: 1 });
jobSchema.index({ stipendAmount: -1 });
jobSchema.index({ status: 1, experienceLevel: 1 });
jobSchema.index({ status: 1, featured: -1, createdAt: -1 });
jobSchema.index({ postedBy: 1, status: 1 });

// Virtual id field matching _id string
jobSchema.virtual('id').get(function () {
  return this.slug || this._id.toHexString();
});

const Job = mongoose.model('Job', jobSchema);
export default Job;
