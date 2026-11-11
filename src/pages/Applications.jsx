import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Calendar,
  Trash2,
  ExternalLink,
  RefreshCw,
  Building2,
  MessageSquare,
} from 'lucide-react';
import WorkspaceLayout from '../components/WorkspaceLayout';
import ConfirmDialog from '../components/ConfirmDialog';
import Loader from '../components/Loader';
import { useAuth, useToast } from '../hooks/useContexts';
import api, { API_BASE_URL } from '../services/api';

const STATUS_TABS = ['all', 'pending', 'reviewed', 'shortlisted', 'accepted', 'rejected'];

const Applications = ({ onOpenPostJob }) => {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === 'admin';

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmApp, setConfirmApp] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  const backendOrigin = useMemo(() => API_BASE_URL.replace(/\/api\/?$/, ''), []);

  const fetchApplications = useCallback(() => {
    setLoading(true);
    setError('');
    setRefreshTick((t) => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = isAdmin
          ? await (api.applications.getAllAdmin ? api.applications.getAllAdmin() : api.applications.getRecruiter())
          : await api.applications.getMy();
        if (!cancelled) {
          setApplications(Array.isArray(res?.data) ? res.data : []);
          setError('');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load applications.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, refreshTick]);

  const filteredApplications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return applications.filter((app) => {
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesQuery =
        !q ||
        (app.job?.title || '').toLowerCase().includes(q) ||
        (app.job?.company || '').toLowerCase().includes(q) ||
        (app.fullName || '').toLowerCase().includes(q) ||
        (app.email || '').toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [applications, statusFilter, searchQuery]);

  const handleConfirmWithdraw = async () => {
    if (!confirmApp) return;
    setDeleting(true);
    try {
      await api.applications.delete(confirmApp._id);
      setApplications((prev) => prev.filter((item) => item._id !== confirmApp._id));
      toast.success(isAdmin ? 'Application removed.' : 'Application withdrawn successfully.');
      setConfirmApp(null);
    } catch (err) {
      toast.error(err.message || 'Unable to remove application.');
    } finally {
      setDeleting(false);
    }
  };

  const handleAdminStatusChange = async (appId, newStatus) => {
    try {
      const res = await api.applications.updateStatus(appId, { status: newStatus });
      const updated = res?.data;
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: updated?.status || newStatus } : a))
      );
      toast.success(`Application status updated to ${newStatus}.`);
    } catch (err) {
      toast.error(err.message || 'Could not update application status.');
    }
  };

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
    <WorkspaceLayout title={isAdmin ? 'Platform Applications' : 'My Applications'} onOpenPostJob={onOpenPostJob}>
      <div className="saas-page-header">
        <div>
          <h1 className="saas-page-title">
            {isAdmin ? 'Platform Applications Monitor' : 'My Applications'}
          </h1>
          <p className="saas-page-subtitle">
            {isAdmin
              ? 'Oversee candidate submissions and hiring statuses across all partner companies.'
              : 'Monitor real-time status updates, recruiter feedback, and resume records.'}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchApplications}
          disabled={loading}
          className="btn btn-secondary btn-sm"
        >
          <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs + Search Bar */}
      <div className="saas-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div className="saas-tabs-bar" style={{ marginBottom: '14px' }}>
          {STATUS_TABS.map((status) => {
            const count =
              status === 'all'
                ? applications.length
                : applications.filter((a) => a.status === status).length;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`saas-tab-pill ${statusFilter === status ? 'active' : ''}`}
                style={{ textTransform: 'capitalize' }}
              >
                <span>{status}</span>
                <span className="badge badge-gray">{count}</span>
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', maxWidth: '420px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            className="saas-input"
            style={{ paddingLeft: '36px' }}
            placeholder={
              isAdmin
                ? 'Search by job title, company, or candidate name...'
                : 'Filter by internship title or company...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <Loader type="skeleton-table" rows={5} />
      ) : error ? (
        <div className="error-state-box">
          <span>{error}</span>
          <button type="button" onClick={fetchApplications} className="btn btn-secondary btn-sm">
            Retry
          </button>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="empty-state-box">
          <div className="empty-state-icon">
            <FileText size={24} />
          </div>
          <h3 style={{ margin: 0 }}>No applications match your filter</h3>
          <p style={{ margin: 0, maxWidth: '420px', fontSize: '0.9rem' }}>
            {applications.length === 0
              ? 'No internship applications found yet.'
              : 'Try resetting your status tab or search filter.'}
          </p>
          {applications.length === 0 && !isAdmin && (
            <Link to="/jobs" className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>
              Browse Open Internships
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredApplications.map((app) => {
            const resumeHref = resolveResumeHref(app.resumeUrl);
            return (
              <article key={app._id} className="saas-card" style={{ padding: '18px 22px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '14px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0, fontSize: '1.05rem' }}>
                        {app.job?.title || 'Internship Role'}
                      </h3>
                      <span className={`badge ${getStatusClass(app.status)}`} style={{ textTransform: 'capitalize' }}>
                        {app.status || 'pending'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '6px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Building2 size={14} /> {app.job?.company || 'Partner Company'}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Calendar size={14} /> Applied{' '}
                        {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recently'}
                      </span>
                      {isAdmin && (
                        <span>
                          Candidate: <strong>{app.fullName || app.applicant?.name}</strong> ({app.email})
                        </span>
                      )}
                    </div>

                    {app.whyInterested && (
                      <p style={{ margin: '10px 0 0', fontSize: '0.87rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {app.whyInterested}
                      </p>
                    )}

                    {app.notes && (
                      <div
                        style={{
                          marginTop: '10px',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--info-bg)',
                          border: '1px solid var(--info-border)',
                          fontSize: '0.83rem',
                          color: 'var(--text-primary)',
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'flex-start',
                        }}
                      >
                        <MessageSquare size={15} style={{ color: 'var(--info)', marginTop: '2px', flexShrink: 0 }} />
                        <div>
                          <strong>Recruiter Note: </strong>
                          {app.notes}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {isAdmin && (
                      <select
                        className="saas-select"
                        style={{ width: 'auto', padding: '6px 10px', fontSize: '0.82rem' }}
                        value={app.status}
                        aria-label="Update application status"
                        onChange={(e) => handleAdminStatusChange(app._id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    )}

                    {resumeHref && (
                      <a
                        href={resumeHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                      >
                        <FileText size={14} />
                        <span>Resume</span>
                      </a>
                    )}

                    {app.job?._id && (
                      <Link
                        to={`/jobs/${app.job.slug || app.job._id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        <span>Job</span>
                        <ExternalLink size={13} />
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => setConfirmApp(app)}
                      className="btn btn-danger btn-sm"
                    >
                      <Trash2 size={14} />
                      <span>{isAdmin ? 'Delete' : 'Withdraw'}</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(confirmApp)}
        onClose={() => setConfirmApp(null)}
        onConfirm={handleConfirmWithdraw}
        loading={deleting}
        title={isAdmin ? 'Delete Application Record' : 'Withdraw Application'}
        message={`Are you sure you want to ${isAdmin ? 'remove' : 'withdraw'} the application for "${confirmApp?.job?.title || 'this internship'}"?`}
        confirmText={isAdmin ? 'Delete Record' : 'Yes, Withdraw'}
      />
    </WorkspaceLayout>
  );
};

export default Applications;
