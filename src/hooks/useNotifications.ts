import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { notificationService } from '../services/notification.service';
import { userService } from '../services/user.service';
import { useRouter } from 'expo-router';
import Constants, { ExecutionEnvironment } from 'expo-constants';

export function useNotifications() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) return;

        let isMounted = true;

        const setupPush = async () => {
            const hasPermission = await notificationService.requestPermissions();
            if (!hasPermission || !isMounted) return;

            try {
                const token = await notificationService.getExpoPushToken();
                if (token && token !== user.fcmToken) {
                    await userService.saveFCMToken(user.uid, token);
                }
            } catch (e) {
                // failed to get token, happens on simulators
            }
        };

        setupPush();

        let responseListener: any = null;
        const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

        if (!isExpoGo) {
            try {
                const Notifications = require('expo-notifications');
                responseListener = Notifications.addNotificationResponseReceivedListener((response: any) => {
                    const { data } = response.notification.request.content;
                    // Handle navigation based on notification data
                    if (data?.screen) {
                        router.push(data.screen as any);
                    }
                });
            } catch (e) {
                console.warn('Could not setup notification listeners');
            }
        }

        return () => {
            isMounted = false;
            if (responseListener && !isExpoGo) {
                try {
                    const Notifications = require('expo-notifications');
                    Notifications.removeNotificationSubscription(responseListener);
                } catch (e) { }
            }
        };
    }, [user, router]);
}
