import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Building2,
  FileText,
  Upload,
  Save,
  ExternalLink,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import WorkspaceLayout from '../components/WorkspaceLayout';
import Loader from '../components/Loader';
import { useAuth, useToast } from '../hooks/useContexts';
import api, { API_BASE_URL } from '../services/api';

const Profile = ({ onOpenPostJob }) => {
  const { user, updateUserProfile } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    headline: '',
    education: '',
    companyName: '',
    skills: '',
    bio: '',
    resumeUrl: '',
  });

  const backendOrigin = useMemo(() => API_BASE_URL.replace(/\/api\/?$/, ''), []);

  const hydrateFromProfile = useCallback((p) => {
    if (!p) return;
    setFormData({
      name: p.name || '',
      phone: p.phone || '',
      location: p.location || '',
      headline: p.headline || '',
      education: p.education || '',
      companyName: p.companyName || '',
      skills: Array.isArray(p.skills) ? p.skills.join(', ') : '',
      bio: p.bio || '',
      resumeUrl: p.resumeUrl || '',
    });
  }, []);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.users.getProfile();
      const profileData = res?.data?.user || res?.data || user;
      hydrateFromProfile(profileData);
      if (profileData) updateUserProfile(profileData);
    } catch {
      hydrateFromProfile(user);
    } finally {
      setLoading(false);
    }
  }, [hydrateFromProfile, updateUserProfile, user]);

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Full name cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        headline: formData.headline.trim(),
        education: formData.education.trim(),
        companyName: formData.companyName.trim(),
        bio: formData.bio.trim(),
        skills: formData.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        resumeUrl: formData.resumeUrl,
      };
      const res = await api.users.updateProfile(payload);
      const updatedUser = res?.data?.user || res?.data;
      if (updatedUser) {
        updateUserProfile(updatedUser);
        hydrateFromProfile(updatedUser);
      }
      toast.success('Profile details saved successfully.');
    } catch (err) {
      toast.error(err.message || 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF files (.pdf) are allowed for resume uploads.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Resume file size must be 5 MB or less.');
      return;
    }

    setUploadingResume(true);
    try {
      const uploadRes = await api.applications.uploadResume(file);
      const uploadedUrl = uploadRes?.data?.resumeUrl || uploadRes?.resumeUrl || '';
      if (!uploadedUrl) {
        throw new Error('Server did not return a resume URL.');
      }

      const updateRes = await api.users.updateProfile({ resumeUrl: uploadedUrl });
      const updatedUser = updateRes?.data?.user || updateRes?.data;
      if (updatedUser) {
        updateUserProfile(updatedUser);
      }
      setFormData((prev) => ({ ...prev, resumeUrl: uploadedUrl }));
      toast.success('PDF resume uploaded and linked to your profile!');
    } catch (err) {
      toast.error(err.message || 'Resume upload failed.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleRemoveResume = async () => {
    setUploadingResume(true);
    try {
      const updateRes = await api.users.updateProfile({ resumeUrl: '' });
      const updatedUser = updateRes?.data?.user || updateRes?.data;
      if (updatedUser) updateUserProfile(updatedUser);
      setFormData((prev) => ({ ...prev, resumeUrl: '' }));
      toast.info('Resume removed from your profile.');
    } catch (err) {
      toast.error(err.message || 'Unable to remove resume.');
    } finally {
      setUploadingResume(false);
    }
  };

  const resolveResumeUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${backendOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const initials = (formData.name || user?.name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

  const resumeHref = resolveResumeUrl(formData.resumeUrl);

  return (
    <WorkspaceLayout title="Profile & Resume" onOpenPostJob={onOpenPostJob}>
      <div className="saas-page-header">
        <div>
          <h1 className="saas-page-title">Profile & Resume</h1>
          <p className="saas-page-subtitle">
            Keep your qualifications, skills, and default PDF resume ready for instant applications.
          </p>
        </div>
      </div>

      {loading ? (
        <Loader type="spinner" text="Loading your profile..." />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(260px, 340px) 1fr',
            gap: '24px',
            alignItems: 'start',
          }}
          className="profile-saas-grid"
        >
          {/* Left Identity & Resume Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <section className="saas-card" style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '20px',
                  background: 'var(--accent-gradient)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.65rem',
                  fontWeight: 800,
                  margin: '0 auto 14px',
                }}
              >
                {initials}
              </div>
              <h2 style={{ fontSize: '1.2rem', margin: '0 0 4px' }}>{formData.name || user?.name}</h2>
              {formData.headline && (
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: '0 0 10px' }}>
                  {formData.headline}
                </p>
              )}
              <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>
                {user?.role || 'candidate'}
              </span>

              <div
                style={{
                  marginTop: '18px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <span style={{ wordBreak: 'break-all' }}>{user?.email}</span>
                </div>
                {formData.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <span>{formData.phone}</span>
                  </div>
                )}
                {formData.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <span>{formData.location}</span>
                  </div>
                )}
                {formData.education && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GraduationCap size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <span>{formData.education}</span>
                  </div>
                )}
              </div>
            </section>

            {/* PDF Resume Card */}
            <section className="saas-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <FileText size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.02rem', margin: 0 }}>Resume (PDF)</h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Upload a verified PDF resume (max 5 MB) so recruiters can review your credentials immediately.
              </p>

              {resumeHref ? (
                <div
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--success-bg)',
                    border: '1px solid var(--success-border)',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontWeight: 600, fontSize: '0.85rem' }}>
                    <CheckCircle2 size={15} />
                    <span>PDF Resume Attached</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                    <a
                      href={resumeHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      <ExternalLink size={13} />
                      <span>Preview PDF</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleRemoveResume}
                      disabled={uploadingResume}
                      className="btn btn-danger btn-sm"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px dashed var(--border-strong)',
                    fontSize: '0.82rem',
                    color: 'var(--text-muted)',
                    marginBottom: '12px',
                  }}
                >
                  No default resume uploaded yet.
                </div>
              )}

              <label
                className="btn btn-outline-primary btn-sm"
                style={{ width: '100%', cursor: uploadingResume ? 'wait' : 'pointer' }}
              >
                <Upload size={15} />
                <span>{uploadingResume ? 'Uploading PDF...' : resumeHref ? 'Replace PDF Resume' : 'Upload PDF Resume'}</span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleResumeUpload}
                  disabled={uploadingResume}
                  style={{ display: 'none' }}
                />
              </label>
            </section>
          </div>

          {/* Right Form Column */}
          <section className="saas-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <User size={20} style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '1.15rem', margin: 0 }}>Edit Profile Information</h2>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-row-2">
                <div>
                  <label htmlFor="prof-name" style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                    Full Name
                  </label>
                  <input
                    id="prof-name"
                    type="text"
                    className="saas-input"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="prof-phone" style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                    Phone Number
                  </label>
                  <input
                    id="prof-phone"
                    type="tel"
                    className="saas-input"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div>
                  <label htmlFor="prof-location" style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                    City / Location
                  </label>
                  <input
                    id="prof-location"
                    type="text"
                    className="saas-input"
                    placeholder="e.g. Bengaluru, India"
                    value={formData.location}
                    onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                  />
                </div>

                <div>
                  <label htmlFor="prof-education" style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                    Education / Degree
                  </label>
                  <input
                    id="prof-education"
                    type="text"
                    className="saas-input"
                    placeholder="e.g. B.Tech Computer Science (2026)"
                    value={formData.education}
                    onChange={(e) => setFormData((p) => ({ ...p, education: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="prof-headline" style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                  Professional Headline
                </label>
                <input
                  id="prof-headline"
                  type="text"
                  className="saas-input"
                  placeholder="e.g. Full-Stack Developer Intern | React, Node.js, MongoDB"
                  value={formData.headline}
                  onChange={(e) => setFormData((p) => ({ ...p, headline: e.target.value }))}
                />
              </div>

              {user?.role === 'recruiter' && (
                <div>
                  <label htmlFor="prof-company" style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                    <Building2 size={14} style={{ display: 'inline', marginRight: '5px' }} />
                    Company / Organization Name
                  </label>
                  <input
                    id="prof-company"
                    type="text"
                    className="saas-input"
                    value={formData.companyName}
                    onChange={(e) => setFormData((p) => ({ ...p, companyName: e.target.value }))}
                  />
                </div>
              )}

              <div>
                <label htmlFor="prof-skills" style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                  Key Skills (comma-separated)
                </label>
                <input
                  id="prof-skills"
                  type="text"
                  className="saas-input"
                  placeholder="React, Node.js, Express, MongoDB, Tailwind"
                  value={formData.skills}
                  onChange={(e) => setFormData((p) => ({ ...p, skills: e.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="prof-bio" style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                  About / Summary Bio
                </label>
                <textarea
                  id="prof-bio"
                  rows={4}
                  className="saas-textarea"
                  placeholder="Highlight your projects, internships, or career goals..."
                  value={formData.bio}
                  onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  <Save size={16} />
                  <span>{saving ? 'Saving Profile...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </WorkspaceLayout>
  );
};

export default Profile;
