import { create } from 'zustand';
import { Notification } from '../types/firestore.types';

interface NotificationStore {
    notifications: Notification[];
    unreadCount: number;
    setNotifications: (notifications: Notification[]) => void;
    markRead: (id: string) => void;
    markAllRead: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
    notifications: [],
    unreadCount: 0,
    setNotifications: (notifications) => {
        const unreadCount = notifications.filter((n) => !n.isRead).length;
        set({ notifications, unreadCount });
    },
    markRead: (id) =>
        set((state) => {
            const updated = state.notifications.map((n) =>
                n.id === id ? { ...n, isRead: true } : n
            );
            const unreadCount = updated.filter((n) => !n.isRead).length;
            return { notifications: updated, unreadCount };
        }),
    markAllRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
            unreadCount: 0,
        })),
}));
