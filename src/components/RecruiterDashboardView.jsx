import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  CheckCircle2,
  PlusCircle,
  Download,
  Edit3,
  Trash2,
  Eye,
  FileText,
  Search,
  RefreshCw,
  ExternalLink,
  X,
} from 'lucide-react';
import api, { API_BASE_URL } from '../services/api';
import { useAuth, useToast } from '../hooks/useContexts';
import EditJobModal from './EditJobModal';
import ConfirmDialog from './ConfirmDialog';
import Loader from './Loader';

const RecruiterDashboardView = ({ user: propUser, onOpenPostJob }) => {
  const { user: authUser } = useAuth();
  const user = propUser || authUser;
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('jobs');
  const [analytics, setAnalytics] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [selectedJobFilter, setSelectedJobFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Review Drawer
  const [editingJob, setEditingJob] = useState(null);
  const [deleteJobTarget, setDeleteJobTarget] = useState(null);
  const [deletingJob, setDeletingJob] = useState(false);

  const [reviewApp, setReviewApp] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('pending');
  const [reviewNotes, setReviewNotes] = useState('');
  const [savingReview, setSavingReview] = useState(false);

  const backendOrigin = useMemo(() => API_BASE_URL.replace(/\/api\/?$/, ''), []);

  const userId = user?._id || user?.id;
  const [refreshTick, setRefreshTick] = useState(0);

  const fetchData = useCallback(() => {
    if (!userId) return;
    setLoading(true);
    setError('');
    setRefreshTick((t) => t + 1);
  }, [userId]);

  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const [statsRes, jobsRes, appsRes] = await Promise.all([
          api.analytics.getRecruiter().catch(() => null),
          api.jobs.getAll({ postedBy: userId, includeAllStatuses: true, limit: 50 }),
          api.applications.getRecruiter(),
        ]);
        if (cancelled) return;

        setAnalytics(statsRes?.data || null);
        setJobs(Array.isArray(jobsRes?.data) ? jobsRes.data : []);
        const appList = appsRes?.data?.applications || (Array.isArray(appsRes?.data) ? appsRes.data : []);
        setApplications(appList);
        setError('');
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unable to load recruiter workspace data.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, refreshTick]);

  useEffect(() => {
    const onUpdated = () => fetchData();
    window.addEventListener('dg:jobs-updated', onUpdated);
    return () => window.removeEventListener('dg:jobs-updated', onUpdated);
  }, [fetchData]);

  const handleToggleJobStatus = async (job) => {
    const nextStatus = job.status === 'open' ? 'closed' : 'open';
    try {
      await api.jobs.update(job._id, { status: nextStatus });
      setJobs((prev) => prev.map((j) => (j._id === job._id ? { ...j, status: nextStatus } : j)));
      toast.success(`"${job.title}" marked as ${nextStatus}.`);
    } catch (err) {
      toast.error(err.message || 'Could not update listing status.');
    }
  };

  const handleConfirmDeleteJob = async () => {
    if (!deleteJobTarget) return;
    setDeletingJob(true);
    try {
      await api.jobs.delete(deleteJobTarget._id);
      setJobs((prev) => prev.filter((j) => j._id !== deleteJobTarget._id));
      toast.success('Job listing deleted.');
      setDeleteJobTarget(null);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete job.');
    } finally {
      setDeletingJob(false);
    }
  };

  const openReviewModal = (app) => {
    setReviewApp(app);
    setReviewStatus(app.status || 'pending');
    setReviewNotes(app.notes || '');
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!reviewApp) return;
    setSavingReview(true);
    try {
      const res = await api.applications.updateStatus(reviewApp._id, {
        status: reviewStatus,
        notes: reviewNotes.trim(),
      });
      const updated = res?.data;
      setApplications((prev) =>
        prev.map((a) =>
          a._id === reviewApp._id
            ? { ...a, status: updated?.status || reviewStatus, notes: updated?.notes ?? reviewNotes.trim() }
            : a
        )
      );
      toast.success('Candidate review saved & applicant notified.');
      setReviewApp(null);
    } catch (err) {
      toast.error(err.message || 'Failed to save review.');
    } finally {
      setSavingReview(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await api.applications.exportCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `applicants-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Applicants CSV downloaded.');
    } catch (err) {
      toast.error(err.message || 'Failed to export CSV.');
    }
  };

  const filteredApplications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return applications.filter((app) => {
      const matchesJob =
        selectedJobFilter === 'all' || String(app.job?._id || app.job) === String(selectedJobFilter);
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesQuery =
        !q ||
        (app.fullName || app.applicant?.name || '').toLowerCase().includes(q) ||
        (app.email || '').toLowerCase().includes(q) ||
        (app.job?.title || '').toLowerCase().includes(q);
      return matchesJob && matchesStatus && matchesQuery;
    });
  }, [applications, selectedJobFilter, statusFilter, searchQuery]);

  const openJobsCount = useMemo(() => jobs.filter((j) => j.status === 'open').length, [jobs]);
  const shortlistedCount = useMemo(
    () => applications.filter((a) => ['shortlisted', 'accepted'].includes(a.status)).length,
    [applications]
  );

  const getStatusClass = (status) => {
    switch (status) {
      case 'accepted':
        return 'badge-green';
      case 'shortlisted':
        return 'badge-blue';
      case 'reviewed':
        return 'badge-amber';
      case 'rejected':
        return 'badge-red';
      default:
        return 'badge-gray';
    }
  };

  const resolveResumeHref = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${backendOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <>
      <div className="saas-page-header">
        <div>
          <h1 className="saas-page-title">Recruiter Hiring Studio</h1>
          <p className="saas-page-subtitle">
            {user?.companyName ? `${user.companyName} • ` : ''}Manage posted internships, evaluate candidate profiles, and move talent through hiring stages.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button type="button" onClick={fetchData} disabled={loading} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
            <span>Refresh</span>
          </button>
          <button type="button" onClick={handleExportCSV} className="btn btn-secondary btn-sm">
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          {onOpenPostJob && (
            <button type="button" onClick={onOpenPostJob} className="btn btn-primary btn-sm">
              <PlusCircle size={15} />
              <span>Post Internship</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="saas-kpi-grid">
        <div className="saas-kpi-card">
          <div>
            <div className="saas-kpi-value">{analytics?.totalJobs ?? jobs.length}</div>
            <div className="saas-kpi-label">Posted Internships</div>
          </div>
          <div className="saas-kpi-icon" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
            <Briefcase size={20} />
          </div>
        </div>

        <div className="saas-kpi-card">
          <div>
            <div className="saas-kpi-value">{analytics?.activeJobs ?? openJobsCount}</div>
            <div className="saas-kpi-label">Currently Open</div>
          </div>
          <div className="saas-kpi-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="saas-kpi-card">
          <div>
            <div className="saas-kpi-value">{analytics?.applications?.total ?? applications.length}</div>
            <div className="saas-kpi-label">Total Applicants</div>
          </div>
          <div className="saas-kpi-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Users size={20} />
          </div>
        </div>

        <div className="saas-kpi-card">
          <div>
            <div className="saas-kpi-value">{shortlistedCount}</div>
            <div className="saas-kpi-label">Shortlisted / Hired</div>
          </div>
          <div className="saas-kpi-icon" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
            <FileText size={20} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="saas-tabs-bar">
        <button
          type="button"
          onClick={() => setActiveTab('jobs')}
          className={`saas-tab-pill ${activeTab === 'jobs' ? 'active' : ''}`}
        >
          <Briefcase size={15} />
          <span>My Job Listings ({jobs.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('applicants')}
          className={`saas-tab-pill ${activeTab === 'applicants' ? 'active' : ''}`}
        >
          <Users size={15} />
          <span>Applicants Pipeline ({applications.length})</span>
        </button>
      </div>

      {loading ? (
        <Loader type="skeleton-table" rows={5} />
      ) : error ? (
        <div className="error-state-box">
          <span>{error}</span>
          <button type="button" onClick={fetchData} className="btn btn-secondary btn-sm">
            Retry
          </button>
        </div>
      ) : activeTab === 'jobs' ? (
        jobs.length === 0 ? (
          <div className="empty-state-box">
            <div className="empty-state-icon">
              <Briefcase size={24} />
            </div>
            <h3 style={{ margin: 0 }}>You haven&apos;t posted any internships yet</h3>
            <p style={{ margin: 0, maxWidth: '420px', fontSize: '0.9rem' }}>
              Publish your first verified role to start collecting candidate PDF resumes.
            </p>
            {onOpenPostJob && (
              <button type="button" onClick={onOpenPostJob} className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>
                <PlusCircle size={15} /> Post Internship
              </button>
            )}
          </div>
        ) : (
          <div className="saas-table-wrap">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Role Title</th>
                  <th>Category & Mode</th>
                  <th>Stipend</th>
                  <th>Applicants</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{job.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {job.location} • {job.experienceLevel || 'Fresher'}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-blue" style={{ marginRight: '6px' }}>{job.category}</span>
                      <span className="badge badge-gray">{job.workType}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>{job.stipend}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedJobFilter(job._id);
                          setActiveTab('applicants');
                        }}
                        className="btn-ghost"
                        style={{ padding: '4px 8px', borderRadius: '6px', color: 'var(--primary)', fontWeight: 700 }}
                      >
                        {job.applicantsCount ?? 0} candidates
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleJobStatus(job)}
                        className={`badge ${job.status === 'open' ? 'badge-green' : 'badge-gray'}`}
                        style={{ cursor: 'pointer', textTransform: 'capitalize' }}
                        title="Click to toggle Open / Closed"
                      >
                        {job.status}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <Link to={`/jobs/${job.slug || job._id}`} className="btn btn-secondary btn-sm" title="Preview">
                          <ExternalLink size={13} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setEditingJob(job)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Job"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteJobTarget(job)}
                          className="btn btn-danger btn-sm"
                          title="Delete Job"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <>
          {/* Applicants Filter Controls */}
          <div className="saas-card" style={{ marginBottom: '18px', padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Search
                  size={15}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  className="saas-input"
                  style={{ paddingLeft: '34px' }}
                  placeholder="Search candidate name, email, or job..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="saas-select"
                value={selectedJobFilter}
                aria-label="Filter by posted job"
                onChange={(e) => setSelectedJobFilter(e.target.value)}
              >
                <option value="all">All Posted Roles</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>{j.title}</option>
                ))}
              </select>

              <select
                className="saas-select"
                value={statusFilter}
                aria-label="Filter by status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="empty-state-box">
              <div className="empty-state-icon">
                <Users size={24} />
              </div>
              <h3 style={{ margin: 0 }}>No applicants match these filters</h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                Adjust the job filter or status selection to see submissions.
              </p>
            </div>
          ) : (
            <div className="saas-table-wrap">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Applied Role</th>
                    <th>Applied On</th>
                    <th>Status</th>
                    <th>Resume</th>
                    <th style={{ textAlign: 'right' }}>Review</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => {
                    const resumeHref = resolveResumeHref(app.resumeUrl || app.applicant?.resumeUrl);
                    return (
                      <tr key={app._id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{app.fullName || app.applicant?.name || 'Candidate'}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{app.email}</div>
                        </td>
                        <td>{app.job?.title || 'Internship'}</td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recent'}
                        </td>
                        <td>
                          <span className={`badge ${getStatusClass(app.status)}`} style={{ textTransform: 'capitalize' }}>
                            {app.status}
                          </span>
                        </td>
                        <td>
                          {resumeHref ? (
                            <a href={resumeHref} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                              <FileText size={13} /> PDF
                            </a>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button type="button" onClick={() => openReviewModal(app)} className="btn btn-primary btn-sm">
                            <Eye size={14} /> Review
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Candidate Profile Review Modal */}
      {reviewApp && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget && !savingReview) setReviewApp(null);
          }}
        >
          <div className="modal-container" style={{ maxWidth: '600px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '18px 24px',
                borderBottom: '1px solid var(--border-light)',
              }}
            >
              <div>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)' }}>
                  Applicant Review
                </span>
                <h2 style={{ margin: '2px 0 0', fontSize: '1.2rem' }}>
                  {reviewApp.fullName || reviewApp.applicant?.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setReviewApp(null)}
                className="btn-ghost"
                aria-label="Close review modal"
                style={{ padding: '6px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveReview} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.86rem',
                  display: 'grid',
                  gap: '6px',
                }}
              >
                <div><strong>Applying For:</strong> {reviewApp.job?.title || 'Internship'}</div>
                <div><strong>Email:</strong> {reviewApp.email}</div>
                {reviewApp.phone && <div><strong>Phone:</strong> {reviewApp.phone}</div>}
                {reviewApp.applicant?.headline && <div><strong>Headline:</strong> {reviewApp.applicant.headline}</div>}
                {reviewApp.applicant?.education && <div><strong>Education:</strong> {reviewApp.applicant.education}</div>}
                {Array.isArray(reviewApp.applicant?.skills) && reviewApp.applicant.skills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    {reviewApp.applicant.skills.map((sk, idx) => (
                      <span key={idx} className="badge badge-blue">{sk}</span>
                    ))}
                  </div>
                )}
              </div>

              {reviewApp.whyInterested && (
                <div>
                  <strong style={{ fontSize: '0.83rem', display: 'block', marginBottom: '4px' }}>Cover Statement</strong>
                  <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.55, color: 'var(--text-secondary)' }}>
                    {reviewApp.whyInterested}
                  </p>
                </div>
              )}

              <div className="form-row-2">
                <div>
                  <label htmlFor="rev-status" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                    Hiring Stage Status
                  </label>
                  <select
                    id="rev-status"
                    className="saas-select"
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  {resolveResumeHref(reviewApp.resumeUrl || reviewApp.applicant?.resumeUrl) && (
                    <a
                      href={resolveResumeHref(reviewApp.resumeUrl || reviewApp.applicant?.resumeUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ width: '100%' }}
                    >
                      <FileText size={15} />
                      <span>Open Candidate PDF Resume</span>
                    </a>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="rev-notes" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                  Recruiter Feedback / Review Notes
                </label>
                <textarea
                  id="rev-notes"
                  rows={3}
                  className="saas-textarea"
                  placeholder="Optional feedback visible to the candidate (e.g. Interview scheduled on Friday 4 PM)..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" onClick={() => setReviewApp(null)} disabled={savingReview} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={savingReview} className="btn btn-primary">
                  {savingReview ? 'Saving...' : 'Save Review & Notify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <EditJobModal
        isOpen={Boolean(editingJob)}
        job={editingJob}
        onClose={() => setEditingJob(null)}
        onJobUpdated={fetchData}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteJobTarget)}
        onClose={() => setDeleteJobTarget(null)}
        onConfirm={handleConfirmDeleteJob}
        loading={deletingJob}
        title="Delete Job Posting"
        message={`Delete "${deleteJobTarget?.title}"? Existing applicant records linked to this role will also be removed.`}
        confirmText="Delete Listing"
      />
    </>
  );
};

export default RecruiterDashboardView;
