import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { notificationService } from './firestoreEnhanced';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface PushNotificationData {
  type: 'queue_update' | 'booking_confirmed' | 'your_turn' | 'service_started';
  shopId?: string;
  queueItemId?: string;
  bookingId?: string;
  message?: string;
}

export const pushNotificationService = {
  // Register for push notifications
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.warn('Push notifications only work on physical devices');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      throw new Error('Failed to get push token for push notifications');
    }

    try {
      const token = (await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      })).data;
      
      console.log('Push notification token:', token);
      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      throw error;
    }
  },

  // Configure notification channels for Android
  async configureNotificationChannels() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('queue-updates', {
        name: 'Queue Updates',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4F46E5',
        description: 'Notifications about your position in the queue',
      });

      await Notifications.setNotificationChannelAsync('bookings', {
        name: 'Booking Updates',
        importance: Notifications.AndroidImportance.DEFAULT,
        description: 'Notifications about your bookings',
      });
    }
  },

  // Send local notification
  async sendLocalNotification(title: string, body: string, data?: PushNotificationData) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        badge: 1,
      },
      trigger: { seconds: 1 },
    });
  },

  // Handle notification received while app is foregrounded
  addNotificationReceivedListener(handler: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(handler);
  },

  // Handle notification response (user tapped notification)
  addNotificationResponseReceivedListener(handler: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(handler);
  },

  // Clear all notifications
  async clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
  },

  // Set badge count
  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  },

  // Queue position notifications
  async notifyQueuePosition(userId: string, position: number, estimatedWait: number, shopName: string) {
    let message = '';
    
    if (position === 0) {
      message = `It's your turn at ${shopName}! Please head to the shop.`;
    } else if (position === 1) {
      message = `You're next at ${shopName}! Estimated wait: ${estimatedWait} minutes.`;
    } else if (position <= 3) {
      message = `You're ${position + 1} in line at ${shopName}. Estimated wait: ${estimatedWait} minutes.`;
    }
    
    if (message) {
      await notificationService.createNotification({
        userId,
        type: position === 0 ? 'your_turn' : 'queue_update',
        title: position === 0 ? "It's your turn!" : 'Queue Update',
        message,
        payload: {
          position,
          estimatedWait,
          shopName,
        },
      });
    }
  },

  // Booking confirmation notification
  async notifyBookingConfirmed(userId: string, bookingId: string, shopName: string, scheduledTime: Date) {
    const message = `Your booking at ${shopName} for ${scheduledTime.toLocaleDateString()} at ${scheduledTime.toLocaleTimeString()} has been confirmed.`;
    
    await notificationService.createNotification({
      userId,
      type: 'booking_confirmed',
      title: 'Booking Confirmed',
      message,
      payload: {
        bookingId,
        shopName,
        scheduledTime: scheduledTime.toISOString(),
      },
    });
  },

  // Service started notification
  async notifyServiceStarted(userId: string, shopName: string, serviceName: string) {
    const message = `Your ${serviceName} service has started at ${shopName}.`;
    
    await notificationService.createNotification({
      userId,
      type: 'service_started',
      title: 'Service Started',
      message,
      payload: {
        shopName,
        serviceName,
      },
    });
  },
};