import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Trash2, Calendar, FileText, X, ExternalLink } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../hooks/useContexts';
import ConfirmDialog from './ConfirmDialog';
import Loader from './Loader';

const MyApplicationsModalContent = ({ onClose }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmApp, setConfirmApp] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.applications.getMy();
        if (!cancelled) {
          setApplications(Array.isArray(res.data) ? res.data : []);
          setError('');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unable to load your applications.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !confirmApp) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirmApp, onClose]);

  const handleConfirmWithdraw = async () => {
    if (!confirmApp) return;
    setWithdrawing(true);
    try {
      await api.applications.delete(confirmApp._id);
      setApplications((prev) => prev.filter((item) => item._id !== confirmApp._id));
      toast.success('Application withdrawn successfully.');
      setConfirmApp(null);
    } catch (err) {
      toast.error(err.message || 'Failed to withdraw application.');
    } finally {
      setWithdrawing(false);
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

  return (
    <>
      <div
        className="modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="my-apps-modal-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="modal-container" style={{ maxWidth: '640px' }}>
          <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <span className="modal-eyebrow" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)' }}>
                Candidate Tracker
              </span>
              <h2 id="my-apps-modal-title" style={{ margin: '2px 0 0', fontSize: '1.25rem' }}>
                My Applications ({applications.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              aria-label="Close modal"
              style={{ padding: '6px', borderRadius: '8px' }}
            >
              <X size={20} />
            </button>
          </div>

          <div className="modal-body" style={{ padding: '20px 24px' }}>
            {loading ? (
              <Loader type="skeleton-table" rows={3} />
            ) : error ? (
              <div className="error-state-box">
                <span>{error}</span>
                <button type="button" onClick={fetchApplications} className="btn btn-secondary btn-sm">
                  Retry
                </button>
              </div>
            ) : applications.length === 0 ? (
              <div className="empty-state-box" style={{ padding: '32px 20px' }}>
                <div className="empty-state-icon">
                  <Briefcase size={24} />
                </div>
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>No applications submitted yet</h3>
                <p style={{ fontSize: '0.88rem', margin: 0 }}>
                  Explore open internships and apply with your resume to track progress here.
                </p>
                <Link to="/jobs" onClick={onClose} className="btn btn-primary btn-sm" style={{ marginTop: '6px' }}>
                  Browse Internships
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {applications.map((app) => (
                  <div
                    key={app._id}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '0.96rem', color: 'var(--text-primary)' }}>
                          {app.job?.title || 'Internship Listing'}
                        </strong>
                        <span className={`badge ${getStatusClass(app.status)}`} style={{ textTransform: 'capitalize' }}>
                          {app.status || 'pending'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span>{app.job?.company || 'Partner Company'}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} />
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                        {app.resumeFileName && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <FileText size={13} />
                            {app.resumeFileName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {app.job?._id && (
                        <Link
                          to={`/jobs/${app.job.slug || app.job._id}`}
                          onClick={onClose}
                          className="btn btn-secondary btn-sm"
                          title="View Internship Details"
                        >
                          <ExternalLink size={14} />
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => setConfirmApp(app)}
                        className="btn btn-danger btn-sm"
                        title="Withdraw application"
                        aria-label={`Withdraw application for ${app.job?.title || 'internship'}`}
                      >
                        <Trash2 size={14} />
                        <span>Withdraw</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--bg-surface)',
            }}
          >
            <Link to="/applications" onClick={onClose} style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
              Open Full Applications Tracker
            </Link>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Close
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(confirmApp)}
        onClose={() => setConfirmApp(null)}
        onConfirm={handleConfirmWithdraw}
        loading={withdrawing}
        title="Withdraw Application"
        message={`Withdraw your application for "${confirmApp?.job?.title || 'this internship'}"? This removes your submission from the recruiter queue.`}
        confirmText="Yes, Withdraw"
      />
    </>
  );
};

const MyApplicationsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return <MyApplicationsModalContent onClose={onClose} />;
};

export default MyApplicationsModal;
