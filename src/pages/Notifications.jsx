import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  RefreshCw,
  Trash2,
  ExternalLink,
  Briefcase,
  Shield,
  FileText,
} from 'lucide-react';
import WorkspaceLayout from '../components/WorkspaceLayout';
import Loader from '../components/Loader';
import { useNotifications, useToast } from '../hooks/useContexts';
const Notifications = ({ onOpenPostJob }) => {
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const [filter, setFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  const getTypeBadge = (type) => {
    switch (type) {
      case 'application_received':
        return { label: 'Application', icon: <FileText size={14} />, cls: 'badge-blue' };
      case 'status_updated':
        return { label: 'Status Update', icon: <CheckCheck size={14} />, cls: 'badge-green' };
      case 'job_posted':
        return { label: 'New Role', icon: <Briefcase size={14} />, cls: 'badge-amber' };
      default:
        return { label: 'System', icon: <Shield size={14} />, cls: 'badge-gray' };
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteNotification(id);
      toast.success('Notification removed.');
    } catch (err) {
      toast.error(err.message || 'Unable to delete notification.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <WorkspaceLayout title="Notifications" onOpenPostJob={onOpenPostJob}>
      <div className="saas-page-header">
        <div>
          <h1 className="saas-page-title">Notifications Center</h1>
          <p className="saas-page-subtitle">
            Stay up to date with application reviews, recruiter updates, and security alerts.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={fetchNotifications}
            className="btn btn-secondary btn-sm"
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'spin-icon' : ''} />
            <span>Refresh</span>
          </button>
          {unreadCount > 0 && (
            <button type="button" onClick={markAllAsRead} className="btn btn-primary btn-sm">
              <CheckCheck size={15} />
              <span>Mark All Read ({unreadCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="saas-tabs-bar">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`saas-tab-pill ${filter === 'all' ? 'active' : ''}`}
        >
          <span>All Notifications</span>
          <span className="badge badge-gray">{notifications.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`saas-tab-pill ${filter === 'unread' ? 'active' : ''}`}
        >
          <span>Unread</span>
          <span className="badge badge-blue">{unreadCount}</span>
        </button>
      </div>

      {loading && notifications.length === 0 ? (
        <Loader type="skeleton-table" rows={5} />
      ) : filtered.length === 0 ? (
        <div className="empty-state-box">
          <div className="empty-state-icon">
            <Bell size={24} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p style={{ margin: 0, fontSize: '0.9rem', maxWidth: '420px' }}>
            {filter === 'unread'
              ? 'You have read all recent activity alerts.'
              : 'When you apply for internships or receive recruiter responses, updates appear here.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((notif) => {
            const typeMeta = getTypeBadge(notif.type);
            return (
              <div key={notif._id} className={`notif-page-item ${!notif.isRead ? 'unread' : ''}`}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <span className={`badge ${typeMeta.cls}`}>
                      {typeMeta.icon}
                      <span>{typeMeta.label}</span>
                    </span>
                    {!notif.isRead && <span className="badge badge-blue">Unread</span>}
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : 'Just now'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1rem', margin: '0 0 4px', color: 'var(--text-primary)' }}>
                    {notif.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.55 }}>
                    {notif.message}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
                  {notif.link && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!notif.isRead) await markAsRead(notif._id);
                        navigate(notif.link);
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      <span>Open</span>
                      <ExternalLink size={13} />
                    </button>
                  )}

                  {!notif.isRead && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notif._id)}
                      className="btn btn-outline-primary btn-sm"
                      title="Mark as read"
                    >
                      <Check size={14} />
                      <span>Mark Read</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(notif._id)}
                    disabled={deletingId === notif._id}
                    className="btn btn-ghost btn-sm"
                    aria-label="Delete notification"
                    title="Delete notification"
                    style={{ color: 'var(--error)' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </WorkspaceLayout>
  );
};

export default Notifications;
