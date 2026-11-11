import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Sun,
  Moon,
  Bell,
  Lock,
  Trash2,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import WorkspaceLayout from '../components/WorkspaceLayout';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth, useTheme, useToast } from '../hooks/useContexts';
import api from '../services/api';

const Settings = ({ onOpenPostJob }) => {
  const { user, updateUserProfile, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();

  // Password Change State
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwLoading, setPwLoading] = useState(false);

  // Notification Preferences State
  const initialPrefs = user?.notificationPreferences || {
    emailUpdates: true,
    applicationAlerts: true,
    jobRecommendations: true,
  };
  const [prefs, setPrefs] = useState(initialPrefs);
  const [prefsSaving, setPrefsSaving] = useState(false);

  // Delete Account Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword) {
      toast.error('Please enter your current and new password.');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    setPwLoading(true);
    try {
      const res = await api.users.updateProfile({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      const updatedUser = res?.data?.user || res?.data;
      if (updatedUser) {
        updateUserProfile(updatedUser);
      }
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully.');
    } catch (err) {
      toast.error(err.message || 'Unable to update password.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleTogglePref = async (key) => {
    const updatedPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(updatedPrefs);
    setPrefsSaving(true);
    try {
      const res = await api.users.updateProfile({ notificationPreferences: updatedPrefs });
      const updatedUser = res?.data?.user || res?.data;
      if (updatedUser) {
        updateUserProfile(updatedUser);
      }
      toast.success('Notification preferences saved.');
    } catch (err) {
      setPrefs(prefs);
      toast.error(err.message || 'Could not save preferences.');
    } finally {
      setPrefsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await api.users.deleteProfile();
      setDeleteDialogOpen(false);
      toast.info('Your account has been permanently deleted.');
      await logout();
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Failed to delete account.');
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <WorkspaceLayout title="Account Settings" onOpenPostJob={onOpenPostJob}>
      <div className="saas-page-header">
        <div>
          <h1 className="saas-page-title">Settings & Security</h1>
          <p className="saas-page-subtitle">
            Manage theme preferences, account password, notifications, and privacy controls.
          </p>
        </div>
        <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>
          <Shield size={13} /> {user?.role || 'member'} Account
        </span>
      </div>

      <div className="settings-grid">
        {/* Theme & Display */}
        <section className="saas-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            {isDark ? <Moon size={20} style={{ color: 'var(--primary)' }} /> : <Sun size={20} style={{ color: 'var(--warning)' }} />}
            <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Appearance</h2>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Switch between Dark and Light interface themes across all dashboards and portals.
          </p>

          <div className="toggle-switch-row">
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Dark Mode</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Currently using {isDark ? 'Dark Theme' : 'Light Theme'}
              </div>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className={`toggle-switch-btn ${isDark ? 'on' : ''}`}
              role="switch"
              aria-checked={isDark}
              aria-label="Toggle dark mode"
            >
              <span className="toggle-switch-thumb" />
            </button>
          </div>

          <div
            style={{
              marginTop: '14px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={15} style={{ color: 'var(--success)', flexShrink: 0 }} />
            <span>Theme choice automatically persists across sessions.</span>
          </div>
        </section>

        {/* Notification Preferences */}
        <section className="saas-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Bell size={20} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Notification Preferences</h2>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Choose which activity updates appear in your workspace feed.
          </p>

          <div className="toggle-switch-row">
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Application Status Alerts</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Instant alerts when recruiters review or update applications
              </div>
            </div>
            <button
              type="button"
              disabled={prefsSaving}
              onClick={() => handleTogglePref('applicationAlerts')}
              className={`toggle-switch-btn ${prefs.applicationAlerts ? 'on' : ''}`}
              role="switch"
              aria-checked={Boolean(prefs.applicationAlerts)}
              aria-label="Toggle application status alerts"
            >
              <span className="toggle-switch-thumb" />
            </button>
          </div>

          <div className="toggle-switch-row">
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Job & Internship Matches</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Updates for newly published verified internship roles
              </div>
            </div>
            <button
              type="button"
              disabled={prefsSaving}
              onClick={() => handleTogglePref('jobRecommendations')}
              className={`toggle-switch-btn ${prefs.jobRecommendations ? 'on' : ''}`}
              role="switch"
              aria-checked={Boolean(prefs.jobRecommendations)}
              aria-label="Toggle job recommendations"
            >
              <span className="toggle-switch-thumb" />
            </button>
          </div>

          <div className="toggle-switch-row">
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Security & Account Digests</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Important password and role permission updates
              </div>
            </div>
            <button
              type="button"
              disabled={prefsSaving}
              onClick={() => handleTogglePref('emailUpdates')}
              className={`toggle-switch-btn ${prefs.emailUpdates ? 'on' : ''}`}
              role="switch"
              aria-checked={Boolean(prefs.emailUpdates)}
              aria-label="Toggle security updates"
            >
              <span className="toggle-switch-thumb" />
            </button>
          </div>
        </section>

        {/* Change Password */}
        <section className="saas-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <KeyRound size={20} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Change Password</h2>
          </div>
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label htmlFor="currentPassword" style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                className="saas-input"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
                placeholder="Enter current password"
                autoComplete="current-password"
              />
            </div>

            <div>
              <label htmlFor="newPassword" style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                className="saas-input"
                value={passwords.newPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="saas-input"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Re-enter new password"
                autoComplete="new-password"
              />
            </div>

            <button type="submit" disabled={pwLoading} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              <Lock size={15} />
              <span>{pwLoading ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </form>
        </section>

        {/* Danger Zone */}
        <section
          className="saas-card"
          style={{
            borderColor: 'var(--error-border)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: 'var(--error)' }}>
              <Trash2 size={20} />
              <h2 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--error)' }}>Danger Zone</h2>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Permanently delete your account ({user?.email}). All personal profile fields and notifications
              associated with your account will be permanently removed and cannot be undone.
            </p>
          </div>

          <div
            style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Signed in as {user?.email}
            </span>
            <button
              type="button"
              onClick={() => setDeleteDialogOpen(true)}
              className="btn btn-danger btn-sm"
            >
              <Trash2 size={15} />
              <span>Delete Account</span>
            </button>
          </div>
        </section>
      </div>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteAccount}
        loading={deletingAccount}
        title="Delete Your Account Permanently"
        message="This will permanently erase your account profile and sign you out immediately. This action cannot be reversed."
        confirmText="Delete My Account"
      />
    </WorkspaceLayout>
  );
};

export default Settings;
