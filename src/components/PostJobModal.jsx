import React, { useState, useEffect } from 'react';
import { Briefcase, X, AlertCircle, PlusCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth, useToast } from '../hooks/useContexts';
const CATEGORIES = [
  'Web Development',
  'Full Stack Development',
  'Python & AI',
  'UI/UX Design',
  'Data Science & Analytics',
  'Cloud & DevOps',
  'Cyber Security',
];

const INITIAL_STATE = {
  title: '',
  company: '',
  category: 'Web Development',
  workType: 'Remote',
  type: 'internship',
  experienceLevel: 'Fresher',
  location: 'Remote',
  duration: '3 Months',
  stipend: '₹15,000 / month',
  openings: 2,
  deadline: '',
  featured: false,
  skills: '',
  description: '',
  responsibilities: '',
  requirements: '',
};

const PostJobModalContent = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState(() => ({
    ...INITIAL_STATE,
    company: user?.companyName || '',
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
      .map((line) => line.trim())
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
      setError('Please enter at least one required skill (e.g. React, Python).');
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
        location: formData.location.trim() || formData.workType,
        duration: formData.duration.trim() || '3 Months',
        stipend: formData.stipend.trim() || 'Paid Internship',
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

      await api.jobs.create(payload);
      toast.success('Internship posting published successfully!');
      setFormData(INITIAL_STATE);
      if (onSuccess) onSuccess();
      else onClose();
    } catch (err) {
      const msg = err.message || 'Failed to publish internship posting.';
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
      aria-labelledby="post-job-title"
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
            <h2 id="post-job-title" style={{ margin: 0, fontSize: '1.2rem' }}>
              Publish New Opportunity
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
              <label htmlFor="post-title" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                Job / Internship Title <span className="required-star">*</span>
              </label>
              <input
                id="post-title"
                type="text"
                className="saas-input"
                placeholder="e.g. Frontend React Developer Intern"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <label htmlFor="post-company" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                Company Name <span className="required-star">*</span>
              </label>
              <input
                id="post-company"
                type="text"
                className="saas-input"
                placeholder="e.g. Nexora Cloud"
                value={formData.company}
                onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="form-row-2">
            <div>
              <label htmlFor="post-category" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                Category / Domain
              </label>
              <select
                id="post-category"
                className="saas-select"
                value={formData.category}
                onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="post-workType" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                Work Mode
              </label>
              <select
                id="post-workType"
                className="saas-select"
                value={formData.workType}
                onChange={(e) => setFormData((p) => ({ ...p, workType: e.target.value }))}
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div>
              <label htmlFor="post-type" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                Engagement Type
              </label>
              <select
                id="post-type"
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
              <label htmlFor="post-experience" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                Experience Level
              </label>
              <select
                id="post-experience"
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
              <label htmlFor="post-location" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                Location
              </label>
              <input
                id="post-location"
                type="text"
                className="saas-input"
                placeholder="e.g. Bengaluru / Remote"
                value={formData.location}
                onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="post-stipend" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                Stipend / Salary
              </label>
              <input
                id="post-stipend"
                type="text"
                className="saas-input"
                placeholder="e.g. ₹18,000 / month"
                value={formData.stipend}
                onChange={(e) => setFormData((p) => ({ ...p, stipend: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div>
              <label htmlFor="post-duration" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                Duration
              </label>
              <input
                id="post-duration"
                type="text"
                className="saas-input"
                placeholder="e.g. 6 Months"
                value={formData.duration}
                onChange={(e) => setFormData((p) => ({ ...p, duration: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="post-openings" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                Openings & Deadline
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '88px 1fr', gap: '8px' }}>
                <input
                  id="post-openings"
                  type="number"
                  min={1}
                  max={100}
                  className="saas-input"
                  value={formData.openings}
                  onChange={(e) => setFormData((p) => ({ ...p, openings: e.target.value }))}
                />
                <input
                  type="date"
                  className="saas-input"
                  aria-label="Application deadline"
                  value={formData.deadline}
                  onChange={(e) => setFormData((p) => ({ ...p, deadline: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="post-skills" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
              Required Skills (comma-separated)
            </label>
            <input
              id="post-skills"
              type="text"
              className="saas-input"
              placeholder="React, TypeScript, REST APIs, Git"
              value={formData.skills}
              onChange={(e) => setFormData((p) => ({ ...p, skills: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="post-description" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
              Role Description <span className="required-star">*</span>
            </label>
            <textarea
              id="post-description"
              rows={3}
              className="saas-textarea"
              placeholder="Describe day-to-day engineering work, team structure, and goals..."
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              required
            />
          </div>

          <div className="form-row-2">
            <div>
              <label htmlFor="post-resp" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                Responsibilities (one per line)
              </label>
              <textarea
                id="post-resp"
                rows={3}
                className="saas-textarea"
                placeholder="Build reusable React components&#10;Collaborate in sprint reviews"
                value={formData.responsibilities}
                onChange={(e) => setFormData((p) => ({ ...p, responsibilities: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="post-req" style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '5px' }}>
                Requirements (one per line)
              </label>
              <textarea
                id="post-req"
                rows={3}
                className="saas-textarea"
                placeholder="Strong JavaScript fundamentals&#10;Familiarity with Git workflows"
                value={formData.requirements}
                onChange={(e) => setFormData((p) => ({ ...p, requirements: e.target.value }))}
              />
            </div>
          </div>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData((p) => ({ ...p, featured: e.target.checked }))}
            />
            <span>Mark as Featured Internship Listing</span>
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
            <button type="button" onClick={onClose} disabled={submitting} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              <PlusCircle size={16} />
              <span>{submitting ? 'Publishing...' : 'Publish Listing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PostJobModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;
  return <PostJobModalContent onClose={onClose} onSuccess={onSuccess} />;
};

export default PostJobModal;
