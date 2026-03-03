import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import {
    collection, doc, updateDoc, onSnapshot,
    query, orderBy, addDoc, deleteDoc, getCountFromServer,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Notification } from '../types/firestore.types';

// Detect if we are running in Expo Go (Store Client)
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Provide a safe way to access Notifications
let Notifications: any = null;
if (!isExpoGo) {
    try {
        Notifications = require('expo-notifications');
    } catch (e) {
        // expo-notifications could not be loaded
    }
}

/** Path helpers — notifications stored as users/{uid}/notifications/{id} */
const userNotifColl = (userId: string) =>
    collection(db, 'users', userId, 'notifications');

const notifDoc = (userId: string, notifId: string) =>
    doc(db, 'users', userId, 'notifications', notifId);

export const notificationService = {
    requestPermissions: async () => {
        // Expo Go SDK 53+ does not support push notification registration on Android
        if (isExpoGo || !Notifications) {
            if (__DEV__) {
                console.warn('[FadeUp] Push notifications skipped in Expo Go. Use a dev build for full functionality.');
            }
            return false;
        }

        if (Device.isDevice) {
            try {
                const { status: existingStatus } = await Notifications.getPermissionsAsync();
                let finalStatus = existingStatus;
                if (existingStatus !== 'granted') {
                    const { status } = await Notifications.requestPermissionsAsync();
                    finalStatus = status;
                }
                return finalStatus === 'granted';
            } catch {
                return false;
            }
        }
        return false;
    },

    getExpoPushToken: async () => {
        if (isExpoGo || !Device.isDevice || !Notifications) return null;

        try {
            const token = (await Notifications.getExpoPushTokenAsync()).data;
            return token as string;
        } catch {
            return null;
        }
    },

    /**
     * Real-time listener on users/{uid}/notifications, newest first.
     * Returns unsubscribe function.
     */
    subscribeToNotifications: (userId: string, callback: (notifications: Notification[]) => void) => {
        const q = query(userNotifColl(userId), orderBy('createdAt', 'desc'));
        return onSnapshot(q, (snap) => {
            callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification)));
        });
    },

    markAsRead: (userId: string, notifId: string) => {
        return updateDoc(notifDoc(userId, notifId), { isRead: true });
    },

    markAllRead: async (userId: string) => {
        // Optimistic: use a batch of updates — in production consider a Cloud Function
        const snap = await getCountFromServer(userNotifColl(userId));
        if (snap.data().count === 0) return;
        const q = query(userNotifColl(userId));
        const { getDocs, writeBatch } = await import('firebase/firestore');
        const batchSnap = await getDocs(q);
        const batch = writeBatch(db);
        batchSnap.docs.forEach((d) => {
            if (!d.data().isRead) {
                batch.update(d.ref, { isRead: true });
            }
        });
        await batch.commit();
    },

    deleteNotification: (userId: string, notifId: string) => {
        return deleteDoc(notifDoc(userId, notifId));
    },

    /**
     * Create a notification in the target user's subcollection.
     */
    createFirestoreNotification: async (data: Omit<Notification, 'id'>) => {
        try {
            await addDoc(userNotifColl(data.userId), data);
        } catch (e) {
            if (__DEV__) console.error('[FadeUp] Error creating firestore notification:', e);
        }
    },

    createLocalNotification: async (title: string, body: string, data: Record<string, string> = {}) => {
        if (!Notifications) return;
        try {
            await Notifications.scheduleNotificationAsync({
                content: { title, body, data },
                trigger: null,
            });
        } catch (e) {
            if (__DEV__) console.error('[FadeUp] Error creating local notification:', e);
        }
    },
};
