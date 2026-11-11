import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Building2,
  Eye,
  EyeOff,
  GraduationCap,
  Briefcase,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useAuth, useToast } from '../hooks/useContexts';
const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState('candidate');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Please complete all required fields.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (role === 'recruiter' && !formData.companyName.trim()) {
      setError('Company name is required for Recruiter accounts.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role,
      };
      if (role === 'recruiter') {
        payload.companyName = formData.companyName.trim();
      }
      await register(payload);
      toast.success('Account created! Welcome to DG Interns Hub.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.message || 'Registration failed. Please verify your details.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page-wrapper">
      <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="auth-page-card" style={{ width: '100%', maxWidth: '520px' }}>
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <h1 style={{ fontSize: '1.65rem', margin: '0 0 6px' }}>Create Your Account</h1>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
              Choose your role to get started with personalized dashboards
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="auth-role-cards-grid" style={{ marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => setRole('candidate')}
              className={`auth-role-card ${role === 'candidate' ? 'selected' : ''}`}
            >
              <div className="auth-role-icon-box">
                <GraduationCap size={20} />
              </div>
              <div className="auth-role-meta">
                <div className="auth-role-name">Candidate</div>
                <div className="auth-role-desc">Find internships & track applications</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('recruiter')}
              className={`auth-role-card ${role === 'recruiter' ? 'selected' : ''}`}
            >
              <div className="auth-role-icon-box">
                <Briefcase size={20} />
              </div>
              <div className="auth-role-meta">
                <div className="auth-role-name">Recruiter</div>
                <div className="auth-role-desc">Post openings & shortlist applicants</div>
              </div>
            </button>
          </div>

          {error && (
            <div className="auth-alert-banner auth-alert-error" style={{ marginBottom: '16px' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label htmlFor="reg-name" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Full Name
              </label>
              <div className="auth-input-wrapper">
                <User size={16} className="auth-input-icon" />
                <input
                  id="reg-name"
                  type="text"
                  className="auth-input"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>
            </div>

            {role === 'recruiter' && (
              <div>
                <label htmlFor="reg-company" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Company / Organization Name
                </label>
                <div className="auth-input-wrapper">
                  <Building2 size={16} className="auth-input-icon" />
                  <input
                    id="reg-company"
                    type="text"
                    className="auth-input"
                    placeholder="e.g. Nexora Cloud Pvt Ltd"
                    value={formData.companyName}
                    onChange={(e) => setFormData((p) => ({ ...p, companyName: e.target.value }))}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="reg-email" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Email Address
              </label>
              <div className="auth-input-wrapper">
                <Mail size={16} className="auth-input-icon" />
                <input
                  id="reg-email"
                  type="email"
                  className="auth-input"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-row-2">
              <div>
                <label htmlFor="reg-password" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Password
                </label>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Min 6 characters"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="reg-confirm" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Confirm Password
                </label>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    id="reg-confirm"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '6px' }}
            >
              <span>{submitting ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight size={17} />
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Register;
