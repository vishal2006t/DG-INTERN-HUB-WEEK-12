import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Briefcase,
  Bookmark,
  ArrowUpRight,
  Users,
  Sparkles,
} from 'lucide-react';
import { useSavedJobs, useToast } from '../hooks/useContexts';
const JobCard = memo(({ job = {}, onApply }) => {
  const { isSaved, toggleSave } = useSavedJobs();
  const toast = useToast();

  const jobId = job._id || job.id || '';
  const jobRouteKey = job.slug || jobId;
  const companyName =
    typeof job.company === 'string' ? job.company : job.company?.name || 'Company';
  const companyInitial = companyName.charAt(0).toUpperCase() || 'C';
  const locationText = job.location || (job.workType === 'Remote' ? 'Remote' : 'India');
  const categoryText = job.category || 'Engineering';
  const workTypeText = job.workType || 'On-site';
  const jobTypeText = job.type || 'internship';
  const experienceText = job.experienceLevel || 'Fresher';
  const durationText = job.duration || '3-6 Months';
  const stipendText = job.stipend || 'Competitive Stipend';
  const applicantsCount = Number.isFinite(job.applicantsCount) ? job.applicantsCount : 0;

  const postedText =
    job.postedDate ||
    (job.createdAt
      ? new Date(job.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Recently');

  const descriptionText =
    job.shortDescription ||
    (job.description
      ? `${job.description.substring(0, 130)}${job.description.length > 130 ? '...' : ''}`
      : 'Practical opportunity with real product impact, mentorship, and verified stipend.');

  const skillsList = Array.isArray(job.skills) ? job.skills : [];
  const saved = isSaved(jobId);

  const handleBookmarkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave(job);
    toast.info(saved ? `Removed "${job.title}" from saved jobs` : `Saved "${job.title}" to bookmarks`);
  };

  return (
    <article className="job-card" aria-label={job.title || 'Internship listing'}>
      {/* Card Header */}
      <div className="job-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div className="job-card-company-wrap" style={{ display: 'flex', gap: '12px', alignItems: 'center', minWidth: 0 }}>
          <div
            className="company-avatar"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'var(--accent-gradient)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.1rem',
              flexShrink: 0,
            }}
          >
            {companyInitial}
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 className="job-card-title" style={{ margin: 0, fontSize: '1.05rem' }}>
              <Link to={`/jobs/${jobRouteKey}`} className="job-title-link">
                {job.title || 'Internship Role'}
              </Link>
            </h3>
            <div className="company-name" style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {companyName}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleBookmarkClick}
          className={`job-card-bookmark-btn ${saved ? 'saved' : ''}`}
          aria-label={saved ? 'Remove bookmark' : 'Bookmark job'}
          title={saved ? 'Remove from Saved Jobs' : 'Save this listing'}
        >
          <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Category & Mode Badges */}
      <div className="job-card-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        <span className="badge badge-blue">{categoryText}</span>
        <span className={`badge ${workTypeText === 'Remote' ? 'badge-green' : 'badge-gray'}`}>
          {workTypeText}
        </span>
        <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>
          {jobTypeText}
        </span>
        {job.featured && (
          <span className="badge badge-amber">
            <Sparkles size={11} /> Featured
          </span>
        )}
      </div>

      {/* Summary Description */}
      <p
        className="job-card-description"
        style={{
          fontSize: '0.88rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.55,
          margin: 0,
        }}
      >
        {descriptionText}
      </p>

      {/* Meta Grid */}
      <div
        className="job-meta-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '8px',
          padding: '10px 12px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.81rem',
          color: 'var(--text-secondary)',
        }}
      >
        <div className="job-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          <MapPin size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {locationText}
          </span>
        </div>
        <div className="job-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <span>{durationText}</span>
        </div>
        <div className="job-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Briefcase size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <span>{experienceText}</span>
        </div>
        <div className="job-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Users size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <span>{applicantsCount} applicants</span>
        </div>
      </div>

      {/* Skills Chips */}
      {skillsList.length > 0 && (
        <div className="job-skills-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {skillsList.slice(0, 4).map((skill, idx) => (
            <span
              key={`${jobId}-sk-${idx}`}
              className="skill-tag"
              style={{
                fontSize: '0.75rem',
                padding: '3px 9px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-secondary)',
              }}
            >
              {skill}
            </span>
          ))}
          {skillsList.length > 4 && (
            <span
              className="skill-tag-more"
              style={{ fontSize: '0.75rem', padding: '3px 8px', color: 'var(--text-muted)' }}
            >
              +{skillsList.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Footer: Stipend & CTA Actions */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--success)' }}>
            {stipendText}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Posted {postedText}</div>
        </div>

        <div className="job-card-actions" style={{ display: 'flex', gap: '8px' }}>
          <Link to={`/jobs/${jobRouteKey}`} className="btn btn-secondary btn-sm">
            <span>Details</span>
            <ArrowUpRight size={14} />
          </Link>
          {onApply && (
            <button
              type="button"
              onClick={() => onApply(job)}
              className="btn btn-primary btn-sm"
            >
              Apply Now
            </button>
          )}
        </div>
      </div>
    </article>
  );
});

JobCard.displayName = 'JobCard';

export default JobCard;
