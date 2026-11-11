import React, { useState, useEffect } from 'react';
import { Briefcase, X, AlertCircle, Save } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../hooks/useContexts';
const CATEGORIES = [
  'Web Development',
  'Full Stack Development',
  'Python & AI',
  'UI/UX Design',
  'Data Science & Analytics',
  'Cloud & DevOps',
  'Cyber Security',
];

const EditJobModalContent = ({ job, onClose, onJobUpdated }) => {
  const toast = useToast();
  const [formData, setFormData] = useState(() => ({
    title: job.title || '',
    company: typeof job.company === 'string' ? job.company : job.company?.name || '',
    category: job.category || 'Web Development',
    workType: job.workType || 'Remote',
    type: job.type || 'internship',
    experienceLevel: job.experienceLevel || 'Fresher',
    status: job.status || 'open',
    location: job.location || '',
    duration: job.duration || '',
    stipend: job.stipend || '',
    openings: job.openings ?? 1,
    deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
    featured: Boolean(job.featured),
    skills: Array.isArray(job.skills) ? job.skills.join(', ') : '',
    description: job.description || '',
    responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : '',
    requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : '',
  }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [submitting, onClose]);

  const parseLines = (text) =>
    text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.title.trim() || !formData.company.trim() || !formData.description.trim()) {
      setError('Title, company name, and description are required.');
      return;
    }

    const parsedSkills = formData.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (parsedSkills.length === 0) {
      setError('Please enter at least one required skill.');
      return;
    }

    const numericStipend = Number(String(formData.stipend).replace(/[^0-9]/g, '')) || 0;

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        company: formData.company.trim(),
        category: formData.category,
        workType: formData.workType,
        type: formData.type,
        experienceLevel: formData.experienceLevel,
        status: formData.status,
        location: formData.location.trim(),
        duration: formData.duration.trim(),
        stipend: formData.stipend.trim(),
        stipendAmount: numericStipend,
        openings: Math.max(1, Number(formData.openings) || 1),
        featured: Boolean(formData.featured),
        skills: parsedSkills,
        description: formData.description.trim(),
        responsibilities: parseLines(formData.responsibilities),
        requirements: parseLines(formData.requirements),
      };
      if (formData.deadline) {
        payload.deadline = formData.deadline;
      }

      await api.jobs.update(job._id || job.id, payload);
      toast.success('Job listing updated.');
      if (onJobUpdated) onJobUpdated();
      onClose();
    } catch (err) {
      const msg = err.message || 'Unable to update listing.';
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
      aria-labelledby="edit-job-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div className="modal-container" style={{ maxWidth: '660px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Briefcase size={20} style={{ color: 'var(--primary)' }} />
            <h2 id="edit-job-title" style={{ margin: 0, fontSize: '1.2rem' }}>
              Edit Job Listing
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

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-row-2">
            <div>
              <label htmlFor="edit-title" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                Job Title <span className="required-star">*</span>
              </label>
              <input
                id="edit-title"
                type="text"
                className="saas-input"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <label htmlFor="edit-company" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                Company <span className="required-star">*</span>
              </label>
              <input
                id="edit-company"
                type="text"
                className="saas-input"
                value={formData.company}
                onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="form-row-2">
            <div>
              <label htmlFor="edit-category" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                Category
              </label>
              <select
                id="edit-category"
                className="saas-select"
                value={formData.category}
                onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                {!CATEGORIES.includes(formData.category) && (
                  <option value={formData.category}>{formData.category}</option>
                )}
              </select>
            </div>

            <div>
              <label htmlFor="edit-status" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                Listing Status
              </label>
              <select
                id="edit-status"
                className="saas-select"
                value={formData.status}
                onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div>
              <label htmlFor="edit-workType" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                Work Mode
              </label>
              <select
                id="edit-workType"
                className="saas-select"
                value={formData.workType}
                onChange={(e) => setFormData((p) => ({ ...p, workType: e.target.value }))}
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div>
              <label htmlFor="edit-experience" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                Experience Level
              </label>
              <select
                id="edit-experience"
                className="saas-select"
                value={formData.experienceLevel}
                onChange={(e) => setFormData((p) => ({ ...p, experienceLevel: e.target.value }))}
              >
                <option value="Fresher">Fresher</option>
                <option value="0-1 Years">0-1 Years</option>
                <option value="1-3 Years">1-3 Years</option>
                <option value="3+ Years">3+ Years</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div>
              <label htmlFor="edit-type" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                Engagement Type
              </label>
              <select
                id="edit-type"
                className="saas-select"
                value={formData.type}
                onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
              >
                <option value="internship">Internship</option>
                <option value="full-time">Full-Time</option>
                <option value="part-time">Part-Time</option>
                <option value="contract">Contract</option>
              </select>
            </div>

            <div>
              <label htmlFor="edit-location" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                Location
              </label>
              <input
                id="edit-location"
                type="text"
                className="saas-input"
                value={formData.location}
                onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div>
              <label htmlFor="edit-stipend" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                Stipend / Salary
              </label>
              <input
                id="edit-stipend"
                type="text"
                className="saas-input"
                value={formData.stipend}
                onChange={(e) => setFormData((p) => ({ ...p, stipend: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="edit-duration" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                Duration & Openings
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 82px', gap: '8px' }}>
                <input
                  id="edit-duration"
                  type="text"
                  className="saas-input"
                  value={formData.duration}
                  onChange={(e) => setFormData((p) => ({ ...p, duration: e.target.value }))}
                />
                <input
                  type="number"
                  min={1}
                  max={100}
                  aria-label="Openings"
                  className="saas-input"
                  value={formData.openings}
                  onChange={(e) => setFormData((p) => ({ ...p, openings: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="form-row-2">
            <div>
              <label htmlFor="edit-deadline" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                Deadline
              </label>
              <input
                id="edit-deadline"
                type="date"
                className="saas-input"
                value={formData.deadline}
                onChange={(e) => setFormData((p) => ({ ...p, deadline: e.target.value }))}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '8px' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData((p) => ({ ...p, featured: e.target.checked }))}
                />
                <span>Featured Internship Listing</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="edit-skills" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
              Skills (comma-separated)
            </label>
            <input
              id="edit-skills"
              type="text"
              className="saas-input"
              value={formData.skills}
              onChange={(e) => setFormData((p) => ({ ...p, skills: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="edit-description" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
              Description <span className="required-star">*</span>
            </label>
            <textarea
              id="edit-description"
              rows={3}
              className="saas-textarea"
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              required
            />
          </div>

          <div className="form-row-2">
            <div>
              <label htmlFor="edit-resp" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                Responsibilities (one per line)
              </label>
              <textarea
                id="edit-resp"
                rows={3}
                className="saas-textarea"
                value={formData.responsibilities}
                onChange={(e) => setFormData((p) => ({ ...p, responsibilities: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="edit-req" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                Requirements (one per line)
              </label>
              <textarea
                id="edit-req"
                rows={3}
                className="saas-textarea"
                value={formData.requirements}
                onChange={(e) => setFormData((p) => ({ ...p, requirements: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
            <button type="button" onClick={onClose} disabled={submitting} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              <Save size={16} />
              <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditJobModal = ({ isOpen, job, onClose, onJobUpdated }) => {
  if (!isOpen || !job) return null;
  return (
    <EditJobModalContent
      key={job._id || job.id}
      job={job}
      onClose={onClose}
      onJobUpdated={onJobUpdated}
    />
  );
};

export default EditJobModal;
