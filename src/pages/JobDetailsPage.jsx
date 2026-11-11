import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Briefcase,
  Award,
  CheckCircle2,
  Bookmark,
  Share2,
  Users,
  Calendar,
  Building2,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import { useSavedJobs, useToast } from '../hooks/useContexts';
import Loader from '../components/Loader';

const JobDetailsPage = ({ onApplyJob }) => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);
  const { isSaved, toggleSave } = useSavedJobs();
  const toast = useToast();

  const fetchJob = useCallback(() => {
    setLoading(true);
    setError('');
    setRefreshTick((t) => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.jobs.getById(id);
        if (!cancelled) {
          setJob(res?.data || null);
          setError('');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Internship listing could not be found.');
          setJob(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, refreshTick]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Internship link copied to clipboard.');
    } catch {
      toast.info('Copy the URL from your browser bar to share.');
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ padding: '48px 0' }}>
        <div className="container">
          <Loader type="spinner" fullScreen text="Loading internship details..." />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="page-wrapper" style={{ padding: '64px 0' }}>
        <div className="container">
          <div className="empty-state-box">
            <Briefcase size={32} style={{ color: 'var(--error)' }} />
            <h2 style={{ margin: 0 }}>Listing Unavailable</h2>
            <p style={{ margin: 0, maxWidth: '420px' }}>
              {error || 'This internship posting does not exist or may have closed.'}
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button type="button" onClick={fetchJob} className="btn btn-secondary btn-sm">
                <RefreshCw size={14} /> Retry
              </button>
              <Link to="/jobs" className="btn btn-primary btn-sm">
                Back to Internships
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const jobId = job._id || job.id;
  const saved = isSaved(jobId);
  const companyName = typeof job.company === 'string' ? job.company : job.company?.name || 'Partner Company';
  const companyInitial = companyName.charAt(0).toUpperCase();
  const skillsList = Array.isArray(job.skills) ? job.skills : [];
  const responsibilities = Array.isArray(job.responsibilities) ? job.responsibilities : [];
  const requirements = Array.isArray(job.requirements) ? job.requirements : [];
  const learning = Array.isArray(job.learning) ? job.learning : [];
  const benefits = Array.isArray(job.benefits) ? job.benefits : [];

  return (
    <div className="page-wrapper">
      {/* Top Breadcrumb Bar */}
      <div className="details-top-bar">
        <div className="container">
          <div className="breadcrumbs-row">
            <Link to="/jobs" className="back-link">
              <ArrowLeft size={16} />
              <span>All Internships</span>
            </Link>
            <div className="breadcrumb-trail">
              <span>{job.category || 'Engineering'}</span>
              <span className="trail-sep">/</span>
              <span className="current-trail">{job.title}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Content */}
      <section className="details-main-section">
        <div className="container">
          <div className="details-grid-layout">
            {/* Left Main Column */}
            <div className="details-main-column">
              <div className="details-header-card">
                <div className="details-header-top">
                  <div
                    className="company-badge-avatar"
                    style={{
                      background: 'var(--accent-gradient)',
                      color: '#FFFFFF',
                    }}
                  >
                    {companyInitial}
                  </div>
                  <div className="details-header-meta">
                    <div className="details-meta-tags-row">
                      <span className="badge badge-blue">{job.category || 'Engineering'}</span>
                      <span className={`badge ${job.workType === 'Remote' ? 'badge-green' : 'badge-gray'}`}>
                        {job.workType || 'On-site'}
                      </span>
                      <span className={`badge ${job.status === 'closed' ? 'badge-red' : 'badge-green'}`}>
                        {job.status === 'closed' ? 'Closed' : 'Actively Hiring'}
                      </span>
                    </div>
                    <h1 className="details-job-title">{job.title}</h1>
                    <p className="details-company-name">
                      <Building2 size={15} style={{ display: 'inline', marginRight: '6px' }} />
                      {companyName}
                    </p>
                  </div>
                </div>

                <div className="details-key-metrics-bar">
                  <div className="metric-box">
                    <span className="metric-label">Location</span>
                    <span className="metric-value">
                      <MapPin size={14} style={{ color: 'var(--primary)' }} /> {job.location || 'India'}
                    </span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Duration</span>
                    <span className="metric-value">
                      <Clock size={14} style={{ color: 'var(--primary)' }} /> {job.duration || '3-6 Months'}
                    </span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Experience</span>
                    <span className="metric-value">
                      <Briefcase size={14} style={{ color: 'var(--primary)' }} /> {job.experienceLevel || 'Fresher'}
                    </span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Applicants</span>
                    <span className="metric-value">
                      <Users size={14} style={{ color: 'var(--primary)' }} /> {job.applicantsCount ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* About / Overview */}
              <div className="details-section-card">
                <h2 className="details-section-heading">About This Role</h2>
                <p className="details-body-text">
                  {job.about || job.description || job.shortDescription}
                </p>
                {job.whoCanApply && (
                  <p className="details-body-text" style={{ marginTop: '12px' }}>
                    <strong>Eligibility: </strong>
                    {job.whoCanApply}
                  </p>
                )}
              </div>

              {responsibilities.length > 0 && (
                <div className="details-section-card">
                  <h2 className="details-section-heading">Key Responsibilities</h2>
                  <ul className="details-bullet-list">
                    {responsibilities.map((item, idx) => (
                      <li key={idx} className="details-bullet-item">
                        <CheckCircle2 size={17} className="bullet-icon" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {requirements.length > 0 && (
                <div className="details-section-card">
                  <h2 className="details-section-heading">Requirements & Qualifications</h2>
                  <ul className="details-bullet-list">
                    {requirements.map((item, idx) => (
                      <li key={idx} className="details-bullet-item">
                        <CheckCircle2 size={17} className="bullet-icon" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {skillsList.length > 0 && (
                <div className="details-section-card">
                  <h2 className="details-section-heading">Required Skills & Technologies</h2>
                  <div className="details-skills-pills">
                    {skillsList.map((skill, idx) => (
                      <span key={idx} className="skill-pill-large">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(learning.length > 0 || benefits.length > 0) && (
                <div className="details-section-card">
                  <h2 className="details-section-heading">Perks & What You Will Learn</h2>
                  <ul className="details-bullet-list">
                    {[...learning, ...benefits].map((item, idx) => (
                      <li key={idx} className="details-bullet-item">
                        <Award size={17} className="bullet-icon" style={{ color: 'var(--success)' }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Sticky Sidebar */}
            <aside className="details-sidebar-column">
              <div className="sticky-sidebar-card">
                <div className="sidebar-apply-header">
                  <div className="sidebar-stipend-wrap">
                    <span className="stipend-label">Stipend / Compensation</span>
                    <strong className="stipend-amount">{job.stipend || 'Paid Internship'}</strong>
                  </div>
                  <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>
                    {job.type || 'internship'}
                  </span>
                </div>

                <div className="sidebar-meta-list">
                  <div className="sidebar-meta-row">
                    <span className="meta-row-label">Openings</span>
                    <span className="meta-row-value">{job.openings ?? 2} Positions</span>
                  </div>
                  <div className="sidebar-meta-row">
                    <span className="meta-row-label">Apply By</span>
                    <span className="meta-row-value">
                      <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Open until filled'}
                    </span>
                  </div>
                  <div className="sidebar-meta-row">
                    <span className="meta-row-label">Posted On</span>
                    <span className="meta-row-value">
                      {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                </div>

                <div className="sidebar-actions">
                  <button
                    type="button"
                    disabled={job.status === 'closed'}
                    onClick={() => onApplyJob && onApplyJob(job)}
                    className="btn btn-primary sidebar-apply-btn"
                  >
                    {job.status === 'closed' ? 'Applications Closed' : 'Apply For This Role'}
                  </button>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        toggleSave(job);
                        toast.info(saved ? 'Removed from Saved Jobs' : 'Saved to your bookmarks');
                      }}
                      className={`btn ${saved ? 'btn-outline-primary' : 'btn-secondary'} btn-sm`}
                    >
                      <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
                      <span>{saved ? 'Saved' : 'Save'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShare}
                      className="btn btn-secondary btn-sm"
                    >
                      <Share2 size={15} />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                <div className="sidebar-trust-box">
                  <p className="trust-note-text">
                    Direct verified recruiter pipeline. Resume stays private to the hiring team reviewing your application.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JobDetailsPage;
