import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Briefcase, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Loader2, 
  Building2, 
  Phone,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../hooks/useContexts';
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AuthModal = () => {
  const { authModalOpen, authModalMode, closeAuth, login, register } = useAuth();
  const [mode, setMode] = useState(authModalMode || 'login');
  const [prevAuthMode, setPrevAuthMode] = useState(authModalMode);

  if (authModalMode !== prevAuthMode) {
    setPrevAuthMode(authModalMode);
    setMode(authModalMode || 'login');
  }

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'candidate',
    phone: '',
    companyName: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  // Focus trap & Escape key listener
  useEffect(() => {
    if (!authModalOpen) return;

    // Prevent body scroll when modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeAuth();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Auto-focus first input after modal opens
    const focusTimer = setTimeout(() => {
      if (firstInputRef.current) {
        firstInputRef.current.focus();
      }
    }, 50);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(focusTimer);
    };
  }, [authModalOpen, mode, closeAuth]);

  if (!authModalOpen) return null;

  const validateField = (name, value, currentRole = formData.role) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Full name must be at least 2 characters';
        return '';
      case 'email':
        if (!value.trim()) return 'Email address is required';
        if (!emailRegex.test(value.trim())) return 'Please enter a valid email address (e.g., name@example.com)';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (mode === 'register' && value.length < 6) return 'Password must be at least 6 characters';
        return '';
      case 'companyName':
        if (mode === 'register' && currentRole === 'recruiter' && !value.trim()) {
          return 'Company or organization name is required';
        }
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific error as user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    if (serverError) {
      setServerError('');
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setFieldErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleTabSwitch = (newMode) => {
    if (loading) return;
    setMode(newMode);
    setFieldErrors({});
    setServerError('');
    setSuccessMsg('');
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
    if (selectedRole === 'candidate' && fieldErrors.companyName) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.companyName;
        return next;
      });
    }
  };

  const validateAll = () => {
    const errors = {};

    if (mode === 'register') {
      const nameErr = validateField('name', formData.name);
      if (nameErr) errors.name = nameErr;

      if (formData.role === 'recruiter') {
        const compErr = validateField('companyName', formData.companyName, formData.role);
        if (compErr) errors.companyName = compErr;
      }
    }

    const emailErr = validateField('email', formData.email);
    if (emailErr) errors.email = emailErr;

    const passErr = validateField('password', formData.password);
    if (passErr) errors.password = passErr;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMsg('');

    if (!validateAll()) {
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await login(formData.email.trim(), formData.password);
        setSuccessMsg('Signed in successfully! Welcome back.');
      } else {
        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: formData.role,
          phone: formData.phone.trim(),
          companyName: formData.role === 'recruiter' ? formData.companyName.trim() : ''
        };
        await register(payload);
        setSuccessMsg('Account created successfully! Welcome to DG Interns Hub.');
      }
    } catch (err) {
      setServerError(err.message || 'Authentication request failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (email, password) => {
    if (loading) return;
    setServerError('');
    setFieldErrors({});
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setServerError(err.message || 'Quick sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          closeAuth();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div 
        ref={modalRef} 
        className="auth-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="auth-modal-header">
          <div className="auth-modal-header-text">
            <span className="auth-modal-eyebrow">
              <Sparkles size={13} className="text-primary" />
              <span>DG Interns Hub Authentication</span>
            </span>
            <h2 id="auth-modal-title" className="auth-modal-title">
              {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="auth-modal-subtitle">
              {mode === 'login' 
                ? 'Sign in to access curated internships and track applications' 
                : 'Join thousands of students and recruiters on DG Interns Hub'}
            </p>
          </div>
          <button
            type="button"
            className="auth-modal-close-btn"
            onClick={closeAuth}
            aria-label="Close dialog"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="auth-modal-body">
          {/* Segmented Mode Switcher */}
          <div className="auth-segmented-tabs" role="tablist" aria-label="Authentication mode selection">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('login')}
              disabled={loading}
              id="tab-sign-in"
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('register')}
              disabled={loading}
              id="tab-create-account"
            >
              Create Account
            </button>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div className="auth-alert-banner auth-alert-error" role="alert">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMsg && (
            <div className="auth-alert-banner auth-alert-success" role="status">
              <CheckCircle2 size={18} className="flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {mode === 'register' && (
              <>
                {/* Account Type Selection */}
                <div className="form-group auth-role-selector">
                  <label className="form-label">
                    Account Type <span className="required-star">*</span>
                  </label>
                  <div className="auth-role-cards-grid" role="radiogroup" aria-label="Select account type">
                    <label 
                      className={`auth-role-card ${formData.role === 'candidate' ? 'selected' : ''}`}
                      onClick={() => handleRoleSelect('candidate')}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="candidate"
                        checked={formData.role === 'candidate'}
                        onChange={handleChange}
                        aria-label="Candidate account type"
                      />
                      <div className="auth-role-icon-box">
                        <User size={18} />
                      </div>
                      <div className="auth-role-meta">
                        <span className="auth-role-name">Candidate</span>
                        <span className="auth-role-desc">Apply & track internships</span>
                      </div>
                    </label>

                    <label 
                      className={`auth-role-card ${formData.role === 'recruiter' ? 'selected' : ''}`}
                      onClick={() => handleRoleSelect('recruiter')}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="recruiter"
                        checked={formData.role === 'recruiter'}
                        onChange={handleChange}
                        aria-label="Recruiter account type"
                      />
                      <div className="auth-role-icon-box">
                        <Briefcase size={18} />
                      </div>
                      <div className="auth-role-meta">
                        <span className="auth-role-name">Recruiter</span>
                        <span className="auth-role-desc">Post jobs & hire talent</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Full Name Field */}
                <div className="form-group">
                  <label className="form-label" htmlFor="auth-name">
                    Full Name <span className="required-star">*</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">
                      <User size={17} />
                    </span>
                    <input
                      ref={firstInputRef}
                      id="auth-name"
                      type="text"
                      name="name"
                      className={`auth-input ${fieldErrors.name ? 'has-error' : ''}`}
                      placeholder="e.g. Alex Johnson"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={loading}
                      autoComplete="name"
                    />
                  </div>
                  {fieldErrors.name && (
                    <div className="auth-field-error" role="alert">
                      <AlertCircle size={14} />
                      <span>{fieldErrors.name}</span>
                    </div>
                  )}
                </div>

                {/* Company Name Field (Recruiters only) */}
                {formData.role === 'recruiter' && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="auth-company">
                      Company / Organization <span className="required-star">*</span>
                    </label>
                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon">
                        <Building2 size={17} />
                      </span>
                      <input
                        id="auth-company"
                        type="text"
                        name="companyName"
                        className={`auth-input ${fieldErrors.companyName ? 'has-error' : ''}`}
                        placeholder="e.g. Nexora Cloud Solutions"
                        value={formData.companyName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={loading}
                        autoComplete="organization"
                      />
                    </div>
                    {fieldErrors.companyName && (
                      <div className="auth-field-error" role="alert">
                        <AlertCircle size={14} />
                        <span>{fieldErrors.companyName}</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Email Address Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="auth-email">
                Email Address <span className="required-star">*</span>
              </label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Mail size={17} />
                </span>
                <input
                  ref={mode === 'login' ? firstInputRef : null}
                  id="auth-email"
                  type="email"
                  name="email"
                  className={`auth-input ${fieldErrors.email ? 'has-error' : ''}`}
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              {fieldErrors.email && (
                <div className="auth-field-error" role="alert">
                  <AlertCircle size={14} />
                  <span>{fieldErrors.email}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div className="d-flex justify-between items-center">
                <label className="form-label" htmlFor="auth-password">
                  Password <span className="required-star">*</span>
                </label>
                {mode === 'register' && (
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Min. 6 characters
                  </span>
                )}
              </div>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Lock size={17} />
                </span>
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`auth-input ${fieldErrors.password ? 'has-error' : ''}`}
                  placeholder={mode === 'login' ? '••••••••' : 'At least 6 characters'}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="auth-password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {fieldErrors.password && (
                <div className="auth-field-error" role="alert">
                  <AlertCircle size={14} />
                  <span>{fieldErrors.password}</span>
                </div>
              )}
            </div>

            {/* Phone Number Field (Optional for registration) */}
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label" htmlFor="auth-phone">
                  Phone Number <span className="text-muted font-normal" style={{ fontSize: '0.78rem' }}>(Optional)</span>
                </label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    <Phone size={17} />
                  </span>
                  <input
                    id="auth-phone"
                    type="tel"
                    name="phone"
                    className="auth-input"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                    autoComplete="tel"
                  />
                </div>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={loading}
              id="auth-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>{mode === 'login' ? 'Signing in...' : 'Creating Account...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Account' : 'Create Free Account'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Quick Demo Sign In Box */}
          <div className="auth-demo-box">
            <div className="auth-demo-header">
              <span className="auth-demo-title">
                <Sparkles size={13} className="text-primary" />
                <span>Quick Demo Sign In</span>
              </span>
              <span className="auth-demo-subtitle">One-click evaluation</span>
            </div>
            <div className="auth-demo-grid">
              <button
                type="button"
                className="auth-demo-btn"
                onClick={() => handleQuickLogin('candidate@example.com', 'CandidatePassword123!')}
                disabled={loading}
                title="Sign in as Alex Johnson (Candidate)"
              >
                <span className="auth-demo-btn-role">Candidate</span>
                <span className="auth-demo-btn-badge">Job Seeker</span>
              </button>

              <button
                type="button"
                className="auth-demo-btn"
                onClick={() => handleQuickLogin('recruiter@nexoracloud.com', 'RecruiterPassword123!')}
                disabled={loading}
                title="Sign in as Sarah Jenkins (Recruiter)"
              >
                <span className="auth-demo-btn-role">Recruiter</span>
                <span className="auth-demo-btn-badge">Employer</span>
              </button>

              <button
                type="button"
                className="auth-demo-btn"
                onClick={() => handleQuickLogin('admin@dginternshub.com', 'AdminPassword123!')}
                disabled={loading}
                title="Sign in as Administrator"
              >
                <span className="auth-demo-btn-role">Admin</span>
                <span className="auth-demo-btn-badge">Platform Lead</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
