import React, { createContext, useContext, useState, useEffect } from 'react';
import { NotificationItem, notificationsApi } from '../lib/api';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const INITIAL_DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    userId: 'u1',
    title: 'Application Forwarded to District',
    message: 'Your Pre-Matric Scholarship application was verified by Govt Excellence HSS and submitted to District Officer.',
    type: 'SUCCESS',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    link: '/student/applications/app-101',
  },
  {
    id: 'n2',
    userId: 'u1',
    title: 'Free Bicycle Scheme Allotment',
    message: 'Your bicycle asset (VPS-CYC-2026-4412) has arrived at your school depot. Handover scheduled for Monday.',
    type: 'INFO',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    link: '/student/benefits',
  },
  {
    id: 'n3',
    userId: 'u1',
    title: 'Income Certificate Verified',
    message: 'Your annual income certificate (validity FY 2026-27) was validated via State e-District portal.',
    type: 'SUCCESS',
    isRead: true,
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    link: '/student/documents',
  },
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_DEMO_NOTIFICATIONS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await notificationsApi.list();
      if (Array.isArray(data) && data.length > 0) {
        setNotifications(data);
      }
    } catch {
      // Keep demo notifications if endpoint not available
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
    } catch {
      // ignore
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllRead();
    } catch {
      // ignore
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
