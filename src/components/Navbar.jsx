import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  ArrowRight,
  User,
  LogOut,
  FileText,
  PlusCircle,
  LayoutDashboard,
  Bookmark,
  Bell,
  Settings,
  ChevronDown,
} from 'lucide-react';
import dgLogo from '../assets/dg-interns-hub-logo.png';
import { useAuth, useSavedJobs } from '../hooks/useContexts';
import ThemeToggle from './ThemeToggle';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ onOpenMyApplications, onOpenPostJob }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { savedCount } = useSavedJobs();
  const [mobileMenuPath, setMobileMenuPath] = useState(null);
  const [userDropdownPath, setUserDropdownPath] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const mobileMenuOpen = mobileMenuPath === location.pathname;
  const userDropdownOpen = userDropdownPath === location.pathname;
  const setMobileMenuOpen = (val) =>
    setMobileMenuPath((prev) => (typeof val === 'function' ? val(prev === location.pathname) : val) ? location.pathname : null);
  const setUserDropdownOpen = (val) =>
    setUserDropdownPath((prev) => (typeof val === 'function' ? val(prev === location.pathname) : val) ? location.pathname : null);

  // Close user menu on outside click / Escape
  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownPath(null);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setUserDropdownPath(null);
        setMobileMenuPath(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  const initials = (user?.name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

  const role = user?.role || 'candidate';

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" aria-label="DG Interns Hub Home">
          <img
            src={dgLogo}
            alt="DG Interns Hub"
            className="navbar-brand-logo"
            style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover' }}
          />
          <div className="brand-text-group">
            <span className="brand-title">DG Interns Hub</span>
            <span className="brand-tagline">Talent & Internship Portal</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="desktop-nav" aria-label="Main navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Home
          </NavLink>
          <NavLink
            to="/jobs"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Internships
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Contact
          </NavLink>
          {isAuthenticated && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Dashboard
            </NavLink>
          )}
          {isAuthenticated && role === 'candidate' && (
            <NavLink
              to="/applications"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Applications
            </NavLink>
          )}
        </nav>

        {/* Desktop Right Actions */}
        <div className="navbar-actions">
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              <NotificationDropdown />

              {role === 'recruiter' && onOpenPostJob && (
                <button
                  type="button"
                  onClick={onOpenPostJob}
                  className="btn btn-primary btn-sm desktop-only-cta"
                >
                  <PlusCircle size={15} />
                  <span>Post Job</span>
                </button>
              )}

              {/* User Menu Dropdown */}
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  className="nav-user-pill"
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="menu"
                >
                  <span className="nav-user-avatar">{initials}</span>
                  <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                </button>

                {userDropdownOpen && (
                  <div
                    role="menu"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: '240px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      padding: '8px',
                      zIndex: 300,
                      animation: 'fadeIn 0.14s ease-out',
                    }}
                  >
                    <div
                      style={{
                        padding: '10px 12px',
                        borderBottom: '1px solid var(--border-subtle)',
                        marginBottom: '6px',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {user?.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                        {user?.email}
                      </div>
                      <span
                        className="badge badge-blue"
                        style={{ marginTop: '6px', textTransform: 'capitalize' }}
                      >
                        {role}
                      </span>
                    </div>

                    <Link
                      to="/dashboard"
                      className="workspace-nav-link"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <span className="workspace-nav-link-inner">
                        <LayoutDashboard size={15} />
                        <span>Dashboard</span>
                      </span>
                    </Link>

                    <Link
                      to="/profile"
                      className="workspace-nav-link"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <span className="workspace-nav-link-inner">
                        <User size={15} />
                        <span>Profile & Resume</span>
                      </span>
                    </Link>

                    <Link
                      to="/saved-jobs"
                      className="workspace-nav-link"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <span className="workspace-nav-link-inner">
                        <Bookmark size={15} />
                        <span>Saved Jobs</span>
                      </span>
                      {savedCount > 0 && <span className="workspace-nav-badge">{savedCount}</span>}
                    </Link>

                    {(role === 'candidate' || role === 'admin') && (
                      <Link
                        to="/applications"
                        className="workspace-nav-link"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <span className="workspace-nav-link-inner">
                          <FileText size={15} />
                          <span>{role === 'admin' ? 'All Applications' : 'My Applications'}</span>
                        </span>
                      </Link>
                    )}

                    {role === 'candidate' && onOpenMyApplications && (
                      <button
                        type="button"
                        className="workspace-nav-link"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenMyApplications();
                        }}
                      >
                        <span className="workspace-nav-link-inner">
                          <FileText size={15} />
                          <span>Quick App Drawer</span>
                        </span>
                      </button>
                    )}

                    <Link
                      to="/notifications"
                      className="workspace-nav-link"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <span className="workspace-nav-link-inner">
                        <Bell size={15} />
                        <span>Notifications</span>
                      </span>
                    </Link>

                    <Link
                      to="/settings"
                      className="workspace-nav-link"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <span className="workspace-nav-link-inner">
                        <Settings size={15} />
                        <span>Settings</span>
                      </span>
                    </Link>

                    <div
                      style={{
                        borderTop: '1px solid var(--border-subtle)',
                        marginTop: '6px',
                        paddingTop: '6px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="workspace-nav-link"
                        style={{ color: 'var(--error)' }}
                      >
                        <span className="workspace-nav-link-inner">
                          <LogOut size={15} />
                          <span>Sign Out</span>
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="desktop-only-auth" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm nav-cta-btn">
                <span>Get Started</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="nav-icon-btn mobile-menu-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer" role="dialog" aria-label="Mobile navigation">
          <div className="mobile-nav-links">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            >
              Home
            </NavLink>
            <NavLink
              to="/jobs"
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            >
              Browse Internships
            </NavLink>
            <NavLink
              to="/saved-jobs"
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            >
              Saved Internships {savedCount > 0 ? `(${savedCount})` : ''}
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            >
              Contact & Support
            </NavLink>

            {isAuthenticated ? (
              <>
                <div
                  style={{
                    height: '1px',
                    backgroundColor: 'var(--border-light)',
                    margin: '8px 0',
                  }}
                />
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                >
                  Dashboard ({role})
                </NavLink>
                {(role === 'candidate' || role === 'admin') && (
                  <NavLink
                    to="/applications"
                    className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  >
                    Applications
                  </NavLink>
                )}
                <NavLink
                  to="/notifications"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                >
                  Notifications
                </NavLink>
                <NavLink
                  to="/profile"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                >
                  Profile & Resume
                </NavLink>
                <NavLink
                  to="/settings"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                >
                  Settings
                </NavLink>
                {role === 'recruiter' && onOpenPostJob && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenPostJob();
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '8px' }}
                  >
                    <PlusCircle size={16} />
                    <span>Post New Internship</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-danger"
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="mobile-drawer-cta" style={{ display: 'grid', gap: '10px', marginTop: '12px' }}>
                <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary" style={{ width: '100%' }}>
                  Create Free Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
