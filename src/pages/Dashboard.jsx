import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Bookmark,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import WorkspaceLayout from '../components/WorkspaceLayout';
import RecruiterDashboardView from '../components/RecruiterDashboardView';
import AdminDashboardView from '../components/AdminDashboardView';
import Loader from '../components/Loader';
import { useAuth, useSavedJobs } from '../hooks/useContexts';
import api from '../services/api';

const CandidateDashboardView = ({ user }) => {
  const { savedCount, savedJobs } = useSavedJobs();
  const [applications, setApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);

  const loadCandidateData = useCallback(() => {
    setLoading(true);
    setError('');
    setRefreshTick((t) => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [appsRes, jobsRes] = await Promise.all([
          api.applications.getMy(),
          api.jobs.getAll({ limit: 4 }),
        ]);
        if (!cancelled) {
          setApplications(Array.isArray(appsRes?.data) ? appsRes.data : []);
          setRecommendedJobs(Array.isArray(jobsRes?.data) ? jobsRes.data : []);
          setError('');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unable to load dashboard summary.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshTick]);

  const profileCompletion = useMemo(() => {
    const checks = [
      Boolean(user?.name),
      Boolean(user?.email),
      Boolean(user?.phone),
      Boolean(user?.bio),
      Array.isArray(user?.skills) && user.skills.length > 0,
      Boolean(user?.resumeUrl),
      Boolean(user?.location || user?.headline),
      Boolean(user?.education),
    ];
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }, [user]);

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

  return (
    <>
      <div className="saas-page-header">
        <div>
          <h1 className="saas-page-title">Welcome back, {user?.name?.split(' ')[0] || 'Candidate'}</h1>
          <p className="saas-page-subtitle">
            Track your active applications, saved internships, and profile readiness in real time.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/profile" className="btn btn-secondary btn-sm">
            <UserCheck size={15} />
            <span>Update Profile</span>
          </Link>
          <Link to="/jobs" className="btn btn-primary btn-sm">
            <Briefcase size={15} />
            <span>Explore Roles</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="saas-kpi-grid">
        <div className="saas-kpi-card">
          <div>
            <div className="saas-kpi-value">{applications.length}</div>
            <div className="saas-kpi-label">Submitted Applications</div>
          </div>
          <div className="saas-kpi-icon" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
            <FileText size={20} />
          </div>
        </div>

        <div className="saas-kpi-card">
          <div>
            <div className="saas-kpi-value">{shortlistedCount}</div>
            <div className="saas-kpi-label">Shortlisted / Offers</div>
          </div>
          <div className="saas-kpi-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="saas-kpi-card">
          <div>
            <div className="saas-kpi-value">{savedCount}</div>
            <div className="saas-kpi-label">Saved Bookmarks</div>
          </div>
          <div className="saas-kpi-icon" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
            <Bookmark size={20} />
          </div>
        </div>

        <div className="saas-kpi-card">
          <div>
            <div className="saas-kpi-value">{profileCompletion}%</div>
            <div className="saas-kpi-label">Profile Readiness</div>
          </div>
          <div className="saas-kpi-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <UserCheck size={20} />
          </div>
        </div>
      </div>

      {/* Profile Readiness Banner when < 100% */}
      {profileCompletion < 100 && (
        <div
          className="saas-card"
          style={{
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            borderColor: 'var(--primary-border)',
            backgroundColor: 'var(--primary-light)',
          }}
        >
          <div style={{ flex: 1, minWidth: '220px' }}>
            <strong style={{ fontSize: '0.96rem', color: 'var(--text-primary)' }}>
              Complete your Candidate Profile ({profileCompletion}%)
            </strong>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {!user?.resumeUrl
                ? 'Upload your PDF resume and add skills so recruiters can review your qualifications faster.'
                : 'Add your education, headline, and phone details to reach 100% completion.'}
            </p>
          </div>
          <Link to="/profile" className="btn btn-primary btn-sm">
            <span>Complete Profile</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {loading ? (
        <Loader type="skeleton-table" rows={4} />
      ) : error ? (
        <div className="error-state-box">
          <span>{error}</span>
          <button type="button" onClick={loadCandidateData} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Recent Applications */}
          <section className="saas-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.08rem', margin: 0 }}>Recent Applications</h2>
              <Link to="/applications" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)' }}>
                View all
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="empty-state-box" style={{ padding: '28px 16px' }}>
                <Clock size={24} style={{ color: 'var(--primary)' }} />
                <p style={{ margin: 0, fontSize: '0.88rem' }}>
                  You haven&apos;t applied to any internships yet.
                </p>
                <Link to="/jobs" className="btn btn-primary btn-sm">
                  Browse Open Roles
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {applications.slice(0, 5).map((app) => (
                  <div
                    key={app._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {app.job?.title || 'Internship Opportunity'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {app.job?.company || 'Partner Company'} •{' '}
                        {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recent'}
                      </div>
                    </div>
                    <span className={`badge ${getStatusClass(app.status)}`} style={{ textTransform: 'capitalize' }}>
                      {app.status || 'pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Saved or Live Openings */}
          <section className="saas-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.08rem', margin: 0 }}>
                {savedCount > 0 ? 'Saved Internships' : 'Latest Live Openings'}
              </h2>
              <Link to={savedCount > 0 ? '/saved-jobs' : '/jobs'} style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)' }}>
                {savedCount > 0 ? 'Manage saved' : 'Browse all'}
              </Link>
            </div>

            {(savedCount > 0 ? savedJobs : recommendedJobs).slice(0, 4).map((job) => (
              <Link
                key={job._id || job.id}
                to={`/jobs/${job.slug || job._id || job.id}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px',
                  marginBottom: '10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {job.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {job.company} • {job.location}
                  </div>
                </div>
                <span className="badge badge-blue">{job.stipend || 'Paid'}</span>
              </Link>
            ))}

            {savedCount === 0 && recommendedJobs.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                No listings available right now.
              </p>
            )}
          </section>
        </div>
      )}
    </>
  );
};

const Dashboard = ({ onOpenPostJob }) => {
  const { user } = useAuth();
  const role = user?.role || 'candidate';

  return (
    <WorkspaceLayout
      title={role === 'admin' ? 'Admin Control Center' : role === 'recruiter' ? 'Recruiter Studio' : 'Candidate Dashboard'}
      onOpenPostJob={onOpenPostJob}
    >
      {role === 'admin' ? (
        <AdminDashboardView user={user} onOpenPostJob={onOpenPostJob} />
      ) : role === 'recruiter' ? (
        <RecruiterDashboardView user={user} onOpenPostJob={onOpenPostJob} />
      ) : (
        <CandidateDashboardView user={user} />
      )}
    </WorkspaceLayout>
  );
};

export default Dashboard;
