import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { collection, doc, updateDoc, onSnapshot, query, where, orderBy, addDoc } from 'firebase/firestore';
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
        console.warn('expo-notifications could not be loaded');
    }
}

export const notificationService = {
    requestPermissions: async () => {
        // Expo Go SDK 53+ does not support push notification registration on Android
        if (isExpoGo || !Notifications) {
            console.warn('[FadeUp] Push notification registration is skipped in Expo Go. Please use a development build for full functionality.');
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
            } catch (e) {
                console.error('[FadeUp] Error requesting permissions:', e);
                return false;
            }
        }
        return false;
    },

    getExpoPushToken: async () => {
        if (isExpoGo || !Device.isDevice || !Notifications) return null;

        try {
            const token = (await Notifications.getExpoPushTokenAsync()).data;
            return token;
        } catch (e) {
            console.error('[FadeUp] Error getting push token:', e);
            return null;
        }
    },

    subscribeToNotifications: (userId: string, callback: (notifications: Notification[]) => void) => {
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        return onSnapshot(q, snap => {
            callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Notification)));
        });
    },

    markAsRead: (id: string) => {
        return updateDoc(doc(db, 'notifications', id), { isRead: true });
    },

    createLocalNotification: async (title: string, body: string, data: Record<string, string> = {}) => {
        if (!Notifications) return;
        try {
            await Notifications.scheduleNotificationAsync({
                content: { title, body, data },
                trigger: null,
            });
        } catch (e) {
            console.error('[FadeUp] Error creating local notification:', e);
        }
    },

    createFirestoreNotification: async (data: Omit<Notification, 'id'>) => {
        try {
            await addDoc(collection(db, 'notifications'), data);
        } catch (e) {
            console.error('[FadeUp] Error creating firestore notification:', e);
        }
    }
};
