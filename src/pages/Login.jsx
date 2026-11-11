import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth, useToast } from '../hooks/useContexts';
const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(formData.email.trim(), formData.password);
      toast.success('Welcome back! Redirecting to your workspace...');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.message || 'Invalid email or password.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const fillCredentials = (email, password) => {
    setFormData({ email, password });
    setError('');
  };

  return (
    <section className="auth-page-wrapper">
      <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="auth-page-card" style={{ width: '100%', maxWidth: '460px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'var(--accent-gradient)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <h1 style={{ fontSize: '1.65rem', margin: '0 0 6px' }}>Welcome Back</h1>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
              Sign in to access your role-based DG Interns Hub workspace
            </p>
          </div>

          {error && (
            <div className="auth-alert-banner auth-alert-error" style={{ marginBottom: '16px' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label htmlFor="login-email" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Email Address
              </label>
              <div className="auth-input-wrapper">
                <Mail size={16} className="auth-input-icon" />
                <input
                  id="login-email"
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

            <div>
              <label htmlFor="login-password" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Password
              </label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Enter your password"
                  autoComplete="current-password"
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

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '4px' }}
            >
              <span>{submitting ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight size={17} />
            </button>
          </form>

          {/* 1-Click Demo Credentials */}
          <div className="auth-demo-box" style={{ marginTop: '22px' }}>
            <div className="auth-demo-header">
              <span className="auth-demo-title">Quick Evaluation Access</span>
              <span className="auth-demo-subtitle">Click a role to auto-fill</span>
            </div>
            <div className="auth-demo-grid">
              <button
                type="button"
                className="auth-demo-btn"
                onClick={() => fillCredentials('candidate@example.com', 'CandidatePassword123!')}
              >
                <span className="auth-demo-btn-role">Candidate</span>
                <span className="auth-demo-btn-badge">Student</span>
              </button>
              <button
                type="button"
                className="auth-demo-btn"
                onClick={() => fillCredentials('recruiter@nexoracloud.com', 'RecruiterPassword123!')}
              >
                <span className="auth-demo-btn-role">Recruiter</span>
                <span className="auth-demo-btn-badge">Hiring</span>
              </button>
              <button
                type="button"
                className="auth-demo-btn"
                onClick={() => fillCredentials('admin@dginternshub.com', 'AdminPassword123!')}
              >
                <span className="auth-demo-btn-role">Admin</span>
                <span className="auth-demo-btn-badge">Platform</span>
              </button>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            New to DG Interns Hub?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Create a free account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;
