import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useContexts';
import { NotificationContext } from './contextObjects';

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      setLoading(true);
      const res = await api.notifications.getAll();
      if (res?.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.warn('[Notifications] Could not fetch:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }
    let active = true;
    const poll = async () => {
      try {
        const res = await api.notifications.getAll();
        if (active && res?.data) {
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (err) {
        console.warn('[Notifications] Could not fetch:', err.message);
      }
    };
    void poll();
    const interval = setInterval(poll, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  const markAsRead = async (id) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.warn('[Notifications] Failed to mark as read:', err.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('[Notifications] Failed to mark all as read:', err.message);
    }
  };

  const deleteNotification = async (id) => {
    const res = await api.notifications.delete(id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    if (res?.data?.unreadCount !== undefined) {
      setUnreadCount(res.data.unreadCount);
    } else {
      await fetchNotifications();
    }
  };

  const visibleNotifications = isAuthenticated ? notifications : [];
  const visibleUnreadCount = isAuthenticated ? unreadCount : 0;

  return (
    <NotificationContext.Provider
      value={{
        notifications: visibleNotifications,
        unreadCount: visibleUnreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
