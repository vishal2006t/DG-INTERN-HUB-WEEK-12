import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../hooks/useContexts';
const FAQ_ITEMS = [
  {
    q: 'How quickly do recruiters review submitted internship applications?',
    a: 'Most hiring teams review applications within 3–5 business days. You receive instant workspace notifications whenever your application status moves to Reviewed, Shortlisted, or Accepted.',
  },
  {
    q: 'What file format is accepted for resumes?',
    a: 'Only verified PDF files up to 5 MB are accepted across both Profile uploads and Job Applications to ensure consistent formatting and security.',
  },
  {
    q: 'Can recruiters manage applicants directly inside the portal?',
    a: 'Yes. Verified Recruiter accounts get a dedicated dashboard to publish roles, edit job requirements, review candidate profiles, add notes, update hiring statuses, and export applicants to CSV.',
  },
];

const Contact = () => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedRecord, setSubmittedRecord] = useState(null);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required.';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!formData.subject.trim()) errs.subject = 'Please specify a topic or subject.';
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errs.message = 'Please enter a message of at least 10 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await api.contact.submit({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });
      setSubmittedRecord(res?.data || { name: formData.name.trim(), email: formData.email.trim() });
      setFormData({ name: '', email: '', subject: '', message: '' });
      toast.success('Inquiry submitted! Our support team will respond shortly.');
    } catch (err) {
      const msg = err.message || 'Unable to submit message right now. Please try again.';
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <section className="contact-header-section" style={{ padding: '44px 0 32px', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <span className="section-eyebrow">Support & Partnerships</span>
          <h1 className="contact-title">Get In Touch With Our Team</h1>
          <p className="contact-subtitle">
            Questions about verified internships, recruiter onboarding, or technical support? Send a direct inquiry logged right to our admin team.
          </p>
        </div>
      </section>

      <section className="contact-main-section" style={{ padding: '48px 0' }}>
        <div className="container">
          <div className="contact-grid">
            {/* Left Info Column */}
            <div>
              <h2 className="contact-col-heading">Direct Contact Channels</h2>
              <p className="contact-col-desc">
                Reach out during business hours or submit the form for tracked support responses.
              </p>

              <div className="contact-cards-stack">
                <div className="contact-item-card">
                  <div className="contact-icon-box">
                    <Mail size={20} className="contact-icon" />
                  </div>
                  <div className="contact-card-content">
                    <span className="contact-card-label">Support Email</span>
                    <div className="contact-card-value">contact@dginternshub.com</div>
                    <span className="contact-card-sub">General & candidate queries</span>
                  </div>
                </div>

                <div className="contact-item-card">
                  <div className="contact-icon-box">
                    <Phone size={20} className="contact-icon" />
                  </div>
                  <div className="contact-card-content">
                    <span className="contact-card-label">Helpline</span>
                    <div className="contact-card-value">+91 98765 43210</div>
                    <span className="contact-card-sub">Mon–Fri, 9:30 AM – 6:30 PM IST</span>
                  </div>
                </div>

                <div className="contact-item-card">
                  <div className="contact-icon-box">
                    <MapPin size={20} className="contact-icon" />
                  </div>
                  <div className="contact-card-content">
                    <span className="contact-card-label">Campus & Hiring Desk</span>
                    <div className="contact-card-value">Bengaluru, Karnataka</div>
                    <span className="contact-card-sub">HSR Layout Sector 2, India</span>
                  </div>
                </div>
              </div>

              <div className="support-hours-banner">
                <Clock size={16} />
                <span>Average response time: under 24 business hours</span>
              </div>
            </div>

            {/* Right Form Column */}
            <div className="contact-form-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <MessageSquare size={20} style={{ color: 'var(--primary)' }} />
                <h2 className="form-card-title" style={{ margin: 0 }}>Send a Message</h2>
              </div>
              <p className="form-card-subtitle">
                Every inquiry is saved and visible to platform administrators for timely follow-up.
              </p>

              {submittedRecord ? (
                <div className="contact-success-state" style={{ padding: '24px 0', textAlign: 'center' }}>
                  <div className="success-icon-wrap" style={{ margin: '0 auto 14px' }}>
                    <CheckCircle2 size={34} />
                  </div>
                  <h3 className="success-state-title">Message Received!</h3>
                  <p className="success-state-desc">
                    Thank you, <strong>{submittedRecord.name}</strong>. Your inquiry has been logged and our team will reply to{' '}
                    <strong>{submittedRecord.email}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmittedRecord(null)}
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: '14px' }}
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit} noValidate>
                  {submitError && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--error-bg)',
                        color: 'var(--error)',
                        border: '1px solid var(--error-border)',
                        fontSize: '0.86rem',
                        marginBottom: '12px',
                      }}
                    >
                      <AlertCircle size={16} />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="contact-name" className="form-label">
                        Full Name <span className="required-star">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        className={`form-input ${errors.name ? 'has-error' : ''}`}
                        placeholder="e.g. Aarav Sharma"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData((p) => ({ ...p, name: e.target.value }));
                          if (errors.name) setErrors((p) => ({ ...p, name: '' }));
                        }}
                      />
                      {errors.name && <span className="form-error-msg">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="contact-email" className="form-label">
                        Email Address <span className="required-star">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        className={`form-input ${errors.email ? 'has-error' : ''}`}
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData((p) => ({ ...p, email: e.target.value }));
                          if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                        }}
                      />
                      {errors.email && <span className="form-error-msg">{errors.email}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-subject" className="form-label">
                      Subject <span className="required-star">*</span>
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      className={`form-input ${errors.subject ? 'has-error' : ''}`}
                      placeholder="e.g. Recruiter Verification / Internship Application Help"
                      value={formData.subject}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, subject: e.target.value }));
                        if (errors.subject) setErrors((p) => ({ ...p, subject: '' }));
                      }}
                    />
                    {errors.subject && <span className="form-error-msg">{errors.subject}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-message" className="form-label">
                      Message <span className="required-star">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      className={`form-input ${errors.message ? 'has-error' : ''}`}
                      placeholder="Share details so we can assist quickly..."
                      value={formData.message}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, message: e.target.value }));
                        if (errors.message) setErrors((p) => ({ ...p, message: '' }));
                      }}
                    />
                    {errors.message && <span className="form-error-msg">{errors.message}</span>}
                  </div>

                  <button type="submit" disabled={submitting} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                    <Send size={16} />
                    <span>{submitting ? 'Sending Inquiry...' : 'Submit Inquiry'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="contact-faq-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-eyebrow">Quick Answers</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>

          <div className="faq-cards-grid">
            {FAQ_ITEMS.map((item, idx) => (
              <div key={idx} className="faq-card">
                <h3 className="faq-question">{item.q}</h3>
                <p className="faq-answer">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
