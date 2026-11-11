import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  FileText,
  Mail,
  Shield,
  Search,
  RefreshCw,
  Trash2,
  Edit3,
  Star,
  PlusCircle,
  Download,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import { useAuth, useToast } from '../hooks/useContexts';
import EditJobModal from './EditJobModal';
import ConfirmDialog from './ConfirmDialog';
import Loader from './Loader';

const AdminDashboardView = ({ user: propUser, onOpenPostJob }) => {
  const { user: authUser } = useAuth();
  const currentUser = propUser || authUser;
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [inquiries, setInquiries] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [userSearch, setUserSearch] = useState('');
  const [jobSearch, setJobSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('all');

  const [editingJob, setEditingJob] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  const loadAllAdminData = useCallback(() => {
    setLoading(true);
    setError('');
    setRefreshTick((t) => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [statsRes, usersRes, jobsRes, appsRes, inquiriesRes] = await Promise.all([
          api.analytics.getAdmin(),
          api.users.getAllAdmin({ limit: 100 }),
          api.jobs.getAll({ limit: 100, includeAllStatuses: true }),
          api.applications.getAllAdmin({ limit: 100 }),
          api.contact.getAllAdmin().catch(() => ({ data: [] })),
        ]);
        if (cancelled) return;

        setAnalytics(statsRes?.data || null);
        const userList = usersRes?.data?.users || (Array.isArray(usersRes?.data) ? usersRes.data : []);
        setUsers(userList);
        setJobs(Array.isArray(jobsRes?.data) ? jobsRes.data : []);
        const appList = appsRes?.data?.applications || (Array.isArray(appsRes?.data) ? appsRes.data : []);
        setApplications(appList);
        setInquiries(Array.isArray(inquiriesRes?.data) ? inquiriesRes.data : []);
        setError('');
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load admin analytics and records.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshTick]);

  useEffect(() => {
    const onUpdated = () => loadAllAdminData();
    window.addEventListener('dg:jobs-updated', onUpdated);
    return () => window.removeEventListener('dg:jobs-updated', onUpdated);
  }, [loadAllAdminData]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.users.updateRoleAdmin(userId, newRole);
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
      toast.success(`User role changed to ${newRole}.`);
    } catch (err) {
      toast.error(err.message || 'Unable to change user role.');
    }
  };

  const handleToggleJobStatus = async (job) => {
    const nextStatus = job.status === 'open' ? 'closed' : 'open';
    try {
      await api.jobs.update(job._id, { status: nextStatus });
      setJobs((prev) => prev.map((j) => (j._id === job._id ? { ...j, status: nextStatus } : j)));
      toast.success(`Job marked ${nextStatus}.`);
    } catch (err) {
      toast.error(err.message || 'Could not update job status.');
    }
  };

  const handleToggleFeatured = async (job) => {
    const nextFeatured = !job.featured;
    try {
      await api.jobs.update(job._id, { featured: nextFeatured });
      setJobs((prev) => prev.map((j) => (j._id === job._id ? { ...j, featured: nextFeatured } : j)));
      toast.success(nextFeatured ? 'Added to Featured internships.' : 'Removed from Featured.');
    } catch (err) {
      toast.error(err.message || 'Could not update featured state.');
    }
  };

  const handleAdminAppStatus = async (appId, newStatus) => {
    try {
      await api.applications.updateStatus(appId, { status: newStatus });
      setApplications((prev) => prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a)));
      toast.success(`Application status changed to ${newStatus}.`);
    } catch (err) {
      toast.error(err.message || 'Could not update application status.');
    }
  };

  const handleResolveInquiry = async (id, nextStatus) => {
    if (!api.contact?.updateStatusAdmin) return;
    try {
      await api.contact.updateStatusAdmin(id, nextStatus);
      setInquiries((prev) => prev.map((inq) => (inq._id === id ? { ...inq, status: nextStatus } : inq)));
      toast.success(`Inquiry marked ${nextStatus}.`);
    } catch (err) {
      toast.error(err.message || 'Could not update inquiry status.');
    }
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    setActionBusy(true);
    try {
      if (confirmAction.type === 'user') {
        await api.users.deleteAdmin(confirmAction.item._id);
        setUsers((prev) => prev.filter((u) => u._id !== confirmAction.item._id));
        toast.success('User deleted from platform.');
      } else if (confirmAction.type === 'job') {
        await api.jobs.delete(confirmAction.item._id);
        setJobs((prev) => prev.filter((j) => j._id !== confirmAction.item._id));
        toast.success('Internship deleted.');
      }
      setConfirmAction(null);
      loadAllAdminData();
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await api.applications.exportCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `platform-applications-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Platform applications exported.');
    } catch (err) {
      toast.error(err.message || 'Export failed.');
    }
  };

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return users.filter(
      (u) => !q || (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  const filteredJobs = useMemo(() => {
    const q = jobSearch.trim().toLowerCase();
    return jobs.filter(
      (j) =>
        !q ||
        (j.title || '').toLowerCase().includes(q) ||
        (j.company || '').toLowerCase().includes(q) ||
        (j.category || '').toLowerCase().includes(q)
    );
  }, [jobs, jobSearch]);

  const filteredApps = useMemo(() => {
    return applications.filter((a) => appStatusFilter === 'all' || a.status === appStatusFilter);
  }, [applications, appStatusFilter]);

  const getStatusClass = (status) => {
    switch (status) {
      case 'accepted':
      case 'resolved':
      case 'open':
        return 'badge-green';
      case 'shortlisted':
        return 'badge-blue';
      case 'reviewed':
      case 'new':
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
          <h1 className="saas-page-title">Admin Control Center</h1>
          <p className="saas-page-subtitle">
            Monitor live database metrics, moderate users & job postings, oversee applications, and respond to inquiries.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button type="button" onClick={loadAllAdminData} disabled={loading} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
            <span>Refresh</span>
          </button>
          <button type="button" onClick={handleExportCSV} className="btn btn-secondary btn-sm">
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          {onOpenPostJob && (
            <button type="button" onClick={onOpenPostJob} className="btn btn-primary btn-sm">
              <PlusCircle size={14} />
              <span>Add Job</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="saas-kpi-grid">
        <div className="saas-kpi-card">
          <div>
            <div className="saas-kpi-value">{analytics?.users?.total ?? users.length}</div>
            <div className="saas-kpi-label">Registered Users</div>
          </div>
          <div className="saas-kpi-icon" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
            <Users size={20} />
          </div>
        </div>

        <div className="saas-kpi-card">
          <div>
            <div className="saas-kpi-value">{analytics?.jobs?.total ?? jobs.length}</div>
            <div className="saas-kpi-label">
              Job Listings ({analytics?.jobs?.open ?? jobs.filter((j) => j.status === 'open').length} Open)
            </div>
          </div>
          <div className="saas-kpi-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
            <Briefcase size={20} />
          </div>
        </div>

        <div className="saas-kpi-card">
          <div>
            <div className="saas-kpi-value">{analytics?.applications?.total ?? applications.length}</div>
            <div className="saas-kpi-label">Platform Applications</div>
          </div>
          <div className="saas-kpi-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <FileText size={20} />
          </div>
        </div>

        <div className="saas-kpi-card">
          <div>
            <div className="saas-kpi-value">{analytics?.inquiries?.open ?? inquiries.filter((i) => i.status !== 'resolved').length}</div>
            <div className="saas-kpi-label">Open Support Inquiries</div>
          </div>
          <div className="saas-kpi-icon" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
            <Mail size={20} />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="saas-tabs-bar">
        <button type="button" onClick={() => setActiveTab('overview')} className={`saas-tab-pill ${activeTab === 'overview' ? 'active' : ''}`}>
          <Shield size={15} /> Overview
        </button>
        <button type="button" onClick={() => setActiveTab('users')} className={`saas-tab-pill ${activeTab === 'users' ? 'active' : ''}`}>
          <Users size={15} /> Users ({users.length})
        </button>
        <button type="button" onClick={() => setActiveTab('jobs')} className={`saas-tab-pill ${activeTab === 'jobs' ? 'active' : ''}`}>
          <Briefcase size={15} /> Jobs ({jobs.length})
        </button>
        <button type="button" onClick={() => setActiveTab('applications')} className={`saas-tab-pill ${activeTab === 'applications' ? 'active' : ''}`}>
          <FileText size={15} /> Applications ({applications.length})
        </button>
        <button type="button" onClick={() => setActiveTab('inquiries')} className={`saas-tab-pill ${activeTab === 'inquiries' ? 'active' : ''}`}>
          <Mail size={15} /> Inquiries ({inquiries.length})
        </button>
      </div>

      {loading ? (
        <Loader type="skeleton-table" rows={6} />
      ) : error ? (
        <div className="error-state-box">
          <span>{error}</span>
          <button type="button" onClick={loadAllAdminData} className="btn btn-secondary btn-sm">Retry</button>
        </div>
      ) : activeTab === 'overview' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '20px' }}>
          <section className="saas-card">
            <h2 style={{ fontSize: '1.08rem', margin: '0 0 14px' }}>Users by Role</h2>
            <div style={{ display: 'grid', gap: '10px' }}>
              {[
                ['candidate', analytics?.users?.candidates ?? users.filter((u) => u.role === 'candidate').length],
                ['recruiter', analytics?.users?.recruiters ?? users.filter((u) => u.role === 'recruiter').length],
                ['admin', analytics?.users?.admins ?? users.filter((u) => u.role === 'admin').length],
              ].map(([r, cnt]) => (
                <div key={r} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)' }}>
                  <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{r}s</span>
                  <span className="badge badge-blue">{cnt}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="saas-card">
            <h2 style={{ fontSize: '1.08rem', margin: '0 0 14px' }}>Applications Pipeline</h2>
            <div style={{ display: 'grid', gap: '10px' }}>
              {[
                ['pending', analytics?.applications?.pending ?? applications.filter((a) => a.status === 'pending').length],
                ['reviewed', analytics?.applications?.reviewed ?? applications.filter((a) => a.status === 'reviewed').length],
                ['shortlisted', analytics?.applications?.shortlistedExact ?? applications.filter((a) => a.status === 'shortlisted').length],
                ['accepted', analytics?.applications?.accepted ?? applications.filter((a) => a.status === 'accepted').length],
                ['rejected', analytics?.applications?.rejected ?? applications.filter((a) => a.status === 'rejected').length],
              ].map(([st, cnt]) => (
                <div key={st} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)' }}>
                  <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{st}</span>
                  <span className={`badge ${getStatusClass(st)}`}>{cnt}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="saas-card">
            <h2 style={{ fontSize: '1.08rem', margin: '0 0 14px' }}>Recent Platform Activity</h2>
            {applications.length === 0 ? (
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>No recent activity recorded.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {applications.slice(0, 5).map((app) => (
                  <div key={app._id} style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', fontSize: '0.84rem' }}>
                    <div style={{ fontWeight: 600 }}>{app.fullName || app.applicant?.name} applied</div>
                    <div style={{ color: 'var(--text-muted)' }}>
                      {app.job?.title || 'Internship'} • {app.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : activeTab === 'users' ? (
        <>
          <div style={{ marginBottom: '16px', maxWidth: '380px', position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="saas-input"
              style={{ paddingLeft: '34px' }}
              placeholder="Search users by name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>

          <div className="saas-table-wrap">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isSelf = String(u._id) === String(currentUser?._id || currentUser?.id);
                  return (
                    <tr key={u._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </td>
                      <td>
                        <select
                          className="saas-select"
                          style={{ width: 'auto', padding: '5px 10px', fontSize: '0.82rem' }}
                          value={u.role}
                          disabled={isSelf}
                          aria-label={`Change role for ${u.name}`}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        >
                          <option value="candidate">Candidate</option>
                          <option value="recruiter">Recruiter</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          disabled={isSelf}
                          onClick={() => setConfirmAction({ type: 'user', item: u })}
                          className="btn btn-danger btn-sm"
                          title={isSelf ? 'Cannot delete your own account here' : 'Delete User'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : activeTab === 'jobs' ? (
        <>
          <div style={{ marginBottom: '16px', maxWidth: '400px', position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="saas-input"
              style={{ paddingLeft: '34px' }}
              placeholder="Search jobs by title, company, or domain..."
              value={jobSearch}
              onChange={(e) => setJobSearch(e.target.value)}
            />
          </div>

          <div className="saas-table-wrap">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Internship</th>
                  <th>Category</th>
                  <th>Applicants</th>
                  <th>Featured</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{job.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {job.company} • {job.location}
                      </div>
                    </td>
                    <td><span className="badge badge-blue">{job.category}</span></td>
                    <td>{job.applicantsCount ?? 0}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(job)}
                        className="btn-ghost"
                        title="Toggle Featured"
                        style={{ color: job.featured ? 'var(--warning)' : 'var(--text-muted)', padding: '4px' }}
                      >
                        <Star size={16} fill={job.featured ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleJobStatus(job)}
                        className={`badge ${getStatusClass(job.status)}`}
                        style={{ cursor: 'pointer', textTransform: 'capitalize' }}
                      >
                        {job.status}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <Link to={`/jobs/${job.slug || job._id}`} className="btn btn-secondary btn-sm">
                          <ExternalLink size={13} />
                        </Link>
                        <button type="button" onClick={() => setEditingJob(job)} className="btn btn-secondary btn-sm">
                          <Edit3 size={13} />
                        </button>
                        <button type="button" onClick={() => setConfirmAction({ type: 'job', item: job })} className="btn btn-danger btn-sm">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : activeTab === 'applications' ? (
        <>
          <div style={{ marginBottom: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['all', 'pending', 'reviewed', 'shortlisted', 'accepted', 'rejected'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setAppStatusFilter(st)}
                className={`saas-tab-pill ${appStatusFilter === st ? 'active' : ''}`}
                style={{ textTransform: 'capitalize' }}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="saas-table-wrap">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Role & Company</th>
                  <th>Applied</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{app.fullName || app.applicant?.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{app.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{app.job?.title || 'Internship'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{app.job?.company}</div>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <select
                        className="saas-select"
                        style={{ width: 'auto', padding: '5px 10px', fontSize: '0.82rem' }}
                        value={app.status}
                        onChange={(e) => handleAdminAppStatus(app._id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : inquiries.length === 0 ? (
        <div className="empty-state-box">
          <div className="empty-state-icon"><Mail size={24} /></div>
          <h3 style={{ margin: 0 }}>No contact inquiries yet</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            Messages submitted via the Contact Us page will appear here in real time.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {inquiries.map((inq) => (
            <div key={inq._id} className="saas-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <strong>{inq.subject}</strong>
                  <span className={`badge ${getStatusClass(inq.status)}`} style={{ textTransform: 'capitalize' }}>
                    {inq.status || 'new'}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  From {inq.name} ({inq.email}) • {inq.createdAt ? new Date(inq.createdAt).toLocaleString() : 'Recent'}
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {inq.message}
                </p>
              </div>
              {inq.status !== 'resolved' && (
                <button
                  type="button"
                  onClick={() => handleResolveInquiry(inq._id, 'resolved')}
                  className="btn btn-secondary btn-sm"
                >
                  <CheckCircle2 size={14} /> Mark Resolved
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <EditJobModal
        isOpen={Boolean(editingJob)}
        job={editingJob}
        onClose={() => setEditingJob(null)}
        onJobUpdated={loadAllAdminData}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        onConfirm={executeConfirmAction}
        loading={actionBusy}
        title={confirmAction?.type === 'user' ? 'Delete User Account' : 'Delete Job Posting'}
        message={
          confirmAction?.type === 'user'
            ? `Permanently delete user "${confirmAction?.item?.name}" (${confirmAction?.item?.email})?`
            : `Permanently delete job listing "${confirmAction?.item?.title}"?`
        }
        confirmText="Delete Permanently"
      />
    </>
  );
};

export default AdminDashboardView;
