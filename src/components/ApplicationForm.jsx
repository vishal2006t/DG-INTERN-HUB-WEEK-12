import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Send,
  Lock,
} from 'lucide-react';
import api from '../services/api';
import { useAuth, useToast } from '../hooks/useContexts';
const ApplicationFormContent = ({ job, onClose }) => {
  const { user, isAuthenticated, openAuth } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState(() => ({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    whyInterested: '',
  }));
  const [resumeFile, setResumeFile] = useState(null);
  const [useProfileResume, setUseProfileResume] = useState(() => Boolean(user?.resumeUrl));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedApp, setSubmittedApp] = useState(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [submitting, onClose]);

  const jobId = job._id || job.id;
  const companyName = typeof job.company === 'string' ? job.company : job.company?.name || 'Company';

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setError('');
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF (.pdf) resume files are accepted.');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Resume size must not exceed 5 MB.');
      e.target.value = '';
      return;
    }

    setResumeFile(file);
    setUseProfileResume(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim() || !formData.email.trim()) {
      setError('Full name and email address are required.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 7) {
      setError('Please enter a valid contact phone number (at least 7 digits).');
      return;
    }
    if (!formData.whyInterested.trim() || formData.whyInterested.trim().length < 20) {
      setError('Please write at least 20 characters explaining why you are a good fit.');
      return;
    }

    setSubmitting(true);
    try {
      let resumeUrl = useProfileResume && user?.resumeUrl ? user.resumeUrl : '';
      let resumeFileName = useProfileResume && user?.resumeUrl ? 'Profile-Resume.pdf' : '';

      if (resumeFile) {
        const uploadRes = await api.applications.uploadResume(resumeFile);
        resumeUrl = uploadRes?.data?.resumeUrl || uploadRes?.resumeUrl || '';
        resumeFileName = uploadRes?.data?.fileName || resumeFile.name;
        if (!resumeUrl) {
          throw new Error('Resume upload failed to return a file URL.');
        }
      }

      const payload = {
        jobId,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        whyInterested: formData.whyInterested.trim(),
        resumeUrl,
        resumeFileName,
      };

      const res = await api.applications.apply(payload);
      setSubmittedApp(res?.data || payload);
      toast.success(`Application submitted to ${companyName}!`);
    } catch (err) {
      const msg = err.message || 'Could not submit application.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div className="modal-container" style={{ maxWidth: '580px' }}>
        <div
          className="modal-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <div>
            <span className="modal-eyebrow" style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)' }}>
              {companyName}
            </span>
            <h2 id="apply-modal-title" style={{ margin: '2px 0 0', fontSize: '1.2rem' }}>
              Apply: {job.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="btn-ghost"
            aria-label="Close modal"
            style={{ padding: '6px', borderRadius: '8px' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {!isAuthenticated ? (
            <div className="empty-state-box" style={{ padding: '32px 20px' }}>
              <div className="empty-state-icon">
                <Lock size={24} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Sign in required to apply</h3>
              <p style={{ margin: 0, fontSize: '0.88rem', maxWidth: '380px' }}>
                Please log in or create a free Candidate account so you can submit your PDF resume and track status updates.
              </p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openAuth('login');
                  }}
                  className="btn btn-primary btn-sm"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openAuth('register');
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  Create Account
                </button>
              </div>
            </div>
          ) : user?.role && user.role !== 'candidate' ? (
            <div className="error-state-box">
              <span>
                Only <strong>Candidate</strong> accounts can submit internship applications. You are currently signed in as <strong>{user.role}</strong>.
              </span>
            </div>
          ) : submittedApp ? (
            <div className="submission-success-view" style={{ textAlign: 'center', padding: '16px 0' }}>
              <div className="success-icon-wrap" style={{ margin: '0 auto 12px', color: 'var(--success)' }}>
                <CheckCircle2 size={44} />
              </div>
              <h3 style={{ margin: '0 0 6px' }}>Application Submitted!</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
                Your application for <strong>{job.title}</strong> at <strong>{companyName}</strong> is now in recruiter review.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <Link to="/applications" onClick={onClose} className="btn btn-primary btn-sm">
                  Track Status
                </Link>
                <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {error && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    backgroundColor: 'var(--error-bg)',
                    color: 'var(--error)',
                    border: '1px solid var(--error-border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.86rem',
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-row-2">
                <div>
                  <label htmlFor="app-name" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                    Full Name <span className="required-star">*</span>
                  </label>
                  <input
                    id="app-name"
                    type="text"
                    className="saas-input"
                    value={formData.fullName}
                    onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="app-email" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                    Email Address <span className="required-star">*</span>
                  </label>
                  <input
                    id="app-email"
                    type="email"
                    className="saas-input"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="app-phone" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                  Phone Number <span className="required-star">*</span>
                </label>
                <input
                  id="app-phone"
                  type="tel"
                  className="saas-input"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label htmlFor="app-why" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                  Cover Note — Why are you a strong fit? <span className="required-star">*</span>
                </label>
                <textarea
                  id="app-why"
                  rows={4}
                  className="saas-textarea"
                  placeholder="Mention relevant projects, tech stack experience, and availability (min 20 characters)..."
                  value={formData.whyInterested}
                  onChange={(e) => setFormData((p) => ({ ...p, whyInterested: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '6px' }}>
                  Resume (PDF Only, Max 5 MB)
                </label>

                {user?.resumeUrl && !resumeFile && (
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      marginBottom: '8px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--primary-light)',
                      border: '1px solid var(--primary-border)',
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={useProfileResume}
                      onChange={(e) => setUseProfileResume(e.target.checked)}
                    />
                    <FileText size={15} style={{ color: 'var(--primary)' }} />
                    <span>Use my existing Profile PDF Resume</span>
                  </label>
                )}

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px dashed var(--border-strong)',
                    backgroundColor: 'var(--bg-surface)',
                    cursor: 'pointer',
                    fontSize: '0.86rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Upload size={18} style={{ color: 'var(--primary)' }} />
                  <span>
                    {resumeFile
                      ? `${resumeFile.name} (${(resumeFile.size / 1024).toFixed(0)} KB)`
                      : 'Click to upload a PDF resume'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <button type="button" onClick={onClose} disabled={submitting} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  <Send size={15} />
                  <span>{submitting ? 'Submitting...' : 'Submit Application'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const ApplicationForm = ({ isOpen, job, onClose }) => {
  if (!isOpen || !job) return null;
  return <ApplicationFormContent key={job._id || job.id} job={job} onClose={onClose} />;
};

export default ApplicationForm;
