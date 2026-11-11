import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Bookmark,
  Bell,
  User,
  Settings,
  PlusCircle,
  Home as HomeIcon,
  LogOut,
  Menu,
  X,
  Search,
} from 'lucide-react';
import { useAuth, useNotifications, useSavedJobs } from '../hooks/useContexts';
const WorkspaceLayout = ({ children, title = 'Workspace', onOpenPostJob }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { savedCount } = useSavedJobs();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const role = user?.role || 'candidate';
  const initials = (user?.name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

  const handleClose = () => setSidebarOpen(false);

  const handleLogout = async () => {
    setSidebarOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <div className="workspace-shell">
      {/* Backdrop for mobile sidebar */}
      <div
        className={`workspace-backdrop ${sidebarOpen ? 'open' : ''}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className={`workspace-sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Workspace navigation">
        <div className="workspace-sidebar-user">
          <div className="workspace-avatar">{initials || 'U'}</div>
          <div className="workspace-user-meta">
            <div className="workspace-user-name">{user?.name || 'Member'}</div>
            <span className="workspace-user-role">
              {role === 'admin' ? 'Administrator' : role === 'recruiter' ? 'Recruiter' : 'Candidate'}
            </span>
          </div>
          <button
            type="button"
            className="btn-ghost mobile-menu-toggle"
            onClick={handleClose}
            aria-label="Close sidebar"
            style={{ padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="workspace-nav-section-label">Workspace</div>
        <nav className="workspace-nav-list">
          <NavLink
            to="/dashboard"
            onClick={handleClose}
            className={({ isActive }) => `workspace-nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="workspace-nav-link-inner">
              <LayoutDashboard size={17} />
              <span>Dashboard</span>
            </span>
          </NavLink>

          {(role === 'candidate' || role === 'admin') && (
            <NavLink
              to="/applications"
              onClick={handleClose}
              className={({ isActive }) => `workspace-nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="workspace-nav-link-inner">
                <FileText size={17} />
                <span>{role === 'admin' ? 'All Applications' : 'My Applications'}</span>
              </span>
            </NavLink>
          )}

          {role === 'recruiter' && onOpenPostJob && (
            <button
              type="button"
              className="workspace-nav-link"
              onClick={() => {
                handleClose();
                onOpenPostJob();
              }}
            >
              <span className="workspace-nav-link-inner">
                <PlusCircle size={17} />
                <span>Post Internship</span>
              </span>
            </button>
          )}

          <NavLink
            to="/jobs"
            onClick={handleClose}
            className={({ isActive }) => `workspace-nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="workspace-nav-link-inner">
              <Search size={17} />
              <span>Explore Listings</span>
            </span>
          </NavLink>

          <NavLink
            to="/saved-jobs"
            onClick={handleClose}
            className={({ isActive }) => `workspace-nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="workspace-nav-link-inner">
              <Bookmark size={17} />
              <span>Saved Jobs</span>
            </span>
            {savedCount > 0 && <span className="workspace-nav-badge">{savedCount}</span>}
          </NavLink>
        </nav>

        <div className="workspace-nav-section-label" style={{ marginTop: '14px' }}>
          Account
        </div>
        <nav className="workspace-nav-list">
          <NavLink
            to="/notifications"
            onClick={handleClose}
            className={({ isActive }) => `workspace-nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="workspace-nav-link-inner">
              <Bell size={17} />
              <span>Notifications</span>
            </span>
            {unreadCount > 0 && <span className="workspace-nav-badge">{unreadCount}</span>}
          </NavLink>

          <NavLink
            to="/profile"
            onClick={handleClose}
            className={({ isActive }) => `workspace-nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="workspace-nav-link-inner">
              <User size={17} />
              <span>Profile & Resume</span>
            </span>
          </NavLink>

          <NavLink
            to="/settings"
            onClick={handleClose}
            className={({ isActive }) => `workspace-nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="workspace-nav-link-inner">
              <Settings size={17} />
              <span>Settings</span>
            </span>
          </NavLink>
        </nav>

        <div className="workspace-sidebar-footer">
          <Link to="/" onClick={handleClose} className="workspace-nav-link">
            <span className="workspace-nav-link-inner">
              <HomeIcon size={17} />
              <span>Public Portal</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="workspace-nav-link"
            style={{ color: 'var(--error)' }}
          >
            <span className="workspace-nav-link-inner">
              <LogOut size={17} />
              <span>Sign Out</span>
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Panel */}
      <div className="workspace-main">
        <div className="workspace-mobile-bar">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open workspace menu"
          >
            <Menu size={16} />
            <span>Menu</span>
          </button>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            {title}
          </span>
          <Link to="/jobs" className="btn btn-outline-primary btn-sm">
            <Briefcase size={15} />
            <span>Jobs</span>
          </Link>
        </div>

        <div className="workspace-content">{children}</div>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
