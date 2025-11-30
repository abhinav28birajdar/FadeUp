import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { notificationService } from '../services/firestoreEnhanced';
import { pushNotificationService } from '../services/pushNotifications';
import { Notification } from '../types';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

interface NotificationProviderProps {
  children: ReactNode;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;

    const unsubscribe = notificationService.subscribeToNotifications(
      user.id,
      (newNotifications) => {
        setNotifications(newNotifications);
        // Update badge count
        pushNotificationService.setBadgeCount(newNotifications.filter(n => !n.isRead).length);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Register for push notifications when user logs in
  useEffect(() => {
    if (!user) return;

    const registerPushToken = async () => {
      try {
        const token = await pushNotificationService.registerForPushNotifications();
        if (token && user) {
          // Update user's push tokens in Firestore
          // This would be handled in the enhanced user service
          console.log('Push token registered:', token);
        }
      } catch (error) {
        console.error('Failed to register push token:', error);
      }
    };

    registerPushToken();
  }, [user]);

  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  const markAsRead = async (notificationId: string): Promise<void> => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    if (!user) return;

    setLoading(true);
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      await pushNotificationService.setBadgeCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearAll = async (): Promise<void> => {
    try {
      await pushNotificationService.clearAllNotifications();
      await pushNotificationService.setBadgeCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
      throw error;
    }
  };

  const refreshNotifications = async (): Promise<void> => {
    if (!user) return;

    setLoading(true);
    try {
      const userNotifications = await notificationService.getUserNotifications(user.id);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        clearAll,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};