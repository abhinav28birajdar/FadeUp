import Constants from 'expo-constants';
import * as Device from 'expo-device';
// Using EventSubscription instead of Subscription
import { Subscription } from 'expo-modules-core';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { logger } from '../utils/logger';
import { supabase } from './supabase';

// Configure notification handler for how notifications should appear to users
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Notification categories for different types of notifications
export enum NotificationCategory {
  QUEUE_UPDATE = 'QUEUE_UPDATE',
  BOOKING_UPDATE = 'BOOKING_UPDATE',
  FEEDBACK_REQUEST = 'FEEDBACK_REQUEST',
  MARKETING = 'MARKETING'
}

// Define notification action types
export const NOTIFICATION_ACTIONS = {
  VIEW_BOOKING: 'VIEW_BOOKING',
  VIEW_QUEUE: 'VIEW_QUEUE',
  LEAVE_FEEDBACK: 'LEAVE_FEEDBACK',
  DISMISS: 'DISMISS'
};

/**
 * Set up notification categories with their respective actions
 */
export async function setupNotificationCategories(): Promise<void> {
  try {
    await Notifications.setNotificationCategoryAsync(NotificationCategory.QUEUE_UPDATE, [
      {
        identifier: NOTIFICATION_ACTIONS.VIEW_QUEUE,
        buttonTitle: 'View Queue',
        options: {
          isDestructive: false,
          isAuthenticationRequired: false,
        },
      },
      {
        identifier: NOTIFICATION_ACTIONS.DISMISS,
        buttonTitle: 'Dismiss',
        options: {
          isDestructive: false,
          isAuthenticationRequired: false,
        },
      },
    ]);

    await Notifications.setNotificationCategoryAsync(NotificationCategory.BOOKING_UPDATE, [
      {
        identifier: NOTIFICATION_ACTIONS.VIEW_BOOKING,
        buttonTitle: 'View Booking',
        options: {
          isDestructive: false,
          isAuthenticationRequired: false,
        },
      },
    ]);

    await Notifications.setNotificationCategoryAsync(NotificationCategory.FEEDBACK_REQUEST, [
      {
        identifier: NOTIFICATION_ACTIONS.LEAVE_FEEDBACK,
        buttonTitle: 'Leave Feedback',
        options: {
          isDestructive: false,
          isAuthenticationRequired: false,
        },
      },
    ]);

  logger.info('Notification categories configured');
  } catch (error) {
  logger.error('Failed to configure notification categories:', error);
  }
}

/**
 * Register for push notifications and return the token
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    // Check if device is physical (not simulator/emulator)
    // This prevents errors on simulators that don't support push notifications
    if (!Device.isDevice) {
  logger.warn('Push notifications are not available on simulator/emulator');
      return null;
    }

    // Setup Android notification channel for Android 8.0+
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#5271FF', // FadeUp primary blue color
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
      
      // Additional channel for queue updates that might be more frequent
      await Notifications.setNotificationChannelAsync('queue_updates', {
        name: 'Queue Updates',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 100, 100, 100],
        lightColor: '#5271FF',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
    }

    // Request permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowDisplayInCarPlay: true,
          allowCriticalAlerts: true,
          provideAppNotificationSettings: true,
        },
      });
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      logger.warn('Failed to get push token for push notification!');
      return null;
    }
    
    // Get the token
    const expoPushToken = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
    
  logger.debug('Expo Push Token:', expoPushToken.data);
    
    return expoPushToken.data;
  } catch (error) {
  logger.error('Error getting push notification token:', error);
    return null;
  }
}

/**
 * Update the user's push notification token in Supabase
 */
export async function updatePushToken(userId: string): Promise<boolean> {
  try {
    const token = await registerForPushNotificationsAsync();
    
    if (!token) {
      return false;
    }
    
    const { error } = await supabase
      .from('users')
      .update({ expo_push_token: token })
      .eq('id', userId);
    
    if (error) {
      logger.error('Error updating push token in database:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updatePushToken:', error);
    return false;
  }
}

/**
 * Set up notification listeners for the app
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationResponseReceived?: (response: Notifications.NotificationResponse) => void
): { unsubscribe: () => void } {
  let notificationListener: Subscription | undefined;
  let responseListener: Subscription | undefined;
  
  // Notification received while app is foregrounded
  notificationListener = Notifications.addNotificationReceivedListener(notification => {
    logger.debug('Notification received in foreground:', notification);
    if (onNotificationReceived) {
      onNotificationReceived(notification);
    }
  });
  
  // User interacted with a notification
  responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    logger.debug('Notification response received:', response);
    
    const { actionIdentifier, notification } = response;
    
    // Handle action buttons
    switch (actionIdentifier) {
      case NOTIFICATION_ACTIONS.VIEW_BOOKING:
        // Navigate to booking details screen
        logger.info('User wants to view booking:', notification.request.content.data);
        break;
      case NOTIFICATION_ACTIONS.VIEW_QUEUE:
        // Navigate to queue screen
        logger.info('User wants to view queue:', notification.request.content.data);
        break;
      case NOTIFICATION_ACTIONS.LEAVE_FEEDBACK:
        // Navigate to feedback form
        logger.info('User wants to leave feedback:', notification.request.content.data);
        break;
    }
    
    if (onNotificationResponseReceived) {
      onNotificationResponseReceived(response);
    }
  });
  
  // Return unsubscribe function
  return {
    unsubscribe: () => {
      if (notificationListener) {
        Notifications.removeNotificationSubscription(notificationListener);
      }
      if (responseListener) {
        Notifications.removeNotificationSubscription(responseListener);
      }
    }
  };
}

/**
 * Schedule a local notification
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data: Record<string, any> = {},
  options: {
    seconds?: number;
    category?: NotificationCategory;
    sound?: boolean;
    badge?: number;
    channelId?: string;
  } = {}
): Promise<string> {
  const { 
    seconds = 1,
    category = undefined,
    sound = true,
    badge = 1,
    channelId = 'default'
  } = options;

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: sound ? 'default' : undefined,
      badge,
      categoryIdentifier: category,
      ...(Platform.OS === 'android' ? { channelId } : {}),
    },
    trigger: { seconds },
  });
  
  return identifier;
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Cancel a specific notification by identifier
 */
export async function cancelNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * CRITICAL NOTE: This function is for demonstration purposes only.
 * In a production application, push notifications MUST be sent from secure server-side logic
 * (e.g., Supabase Edge Functions) triggered by Database Webhooks.
 * The server would securely retrieve the recipient's expo_push_token from the users table.
 */
export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data: object = {},
  options: {
    sound?: string;
    badge?: number;
    category?: NotificationCategory;
    priority?: 'default' | 'normal' | 'high';
    channelId?: string;
  } = {}
): Promise<void> {
  try {
    const { 
      sound = 'default',
      badge = 1,
      category = undefined,
      priority = 'high',
      channelId = 'default'
    } = options;
    
    const message = {
      to: expoPushToken,
      sound,
      title,
      body,
      data: {
        ...data,
        ...(category && { categoryId: category })
      },
      badge,
      priority,
      ...(Platform.OS === 'android' ? { channelId } : {}),
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

  const result = await response.json();
  logger.debug('Push notification sent:', result);
    
    // Store notification in database for history
    // Ideally this would be done server-side
    const { error } = await supabase.from('notifications').insert([
      {
        user_id: (data as any)?.user_id,
        title,
        message: body,
        type: category || 'GENERAL',
        data: data,
        is_read: false
      }
    ]);
    
    if (error) {
      logger.error('Error storing notification in database:', error);
    }
  } catch (error) {
    logger.error('Error sending push notification:', error);
  }
}

/**
 * Generate notification content for common scenarios
 */
export const notificationTemplates = {
  queueAdvanced: (position: number, waitTimeMinutes: number) => ({
    title: 'Queue Update',
    body: `You're up soon! Your position is now ${position}. Estimated wait time: ${waitTimeMinutes} minutes.`,
    category: NotificationCategory.QUEUE_UPDATE,
  }),
  
  readyNow: (shopName: string) => ({
    title: `It's Your Turn!`,
    body: `${shopName} is ready for you now! Please proceed to the shop.`,
    category: NotificationCategory.QUEUE_UPDATE,
  }),
  
  bookingConfirmed: (shopName: string, date: string, time: string) => ({
    title: 'Booking Confirmed',
    body: `Your appointment at ${shopName} on ${date} at ${time} has been confirmed.`,
    category: NotificationCategory.BOOKING_UPDATE,
  }),
  
  bookingReminder: (shopName: string, timeUntil: string) => ({
    title: 'Upcoming Appointment',
    body: `Reminder: Your appointment at ${shopName} is in ${timeUntil}.`,
    category: NotificationCategory.BOOKING_UPDATE,
  }),
  
  feedbackRequest: (shopName: string) => ({
    title: 'How was your experience?',
    body: `We'd love to hear about your recent visit to ${shopName}!`,
    category: NotificationCategory.FEEDBACK_REQUEST,
  }),
  
  shopkeeperNewBooking: (customerName: string) => ({
    title: 'New Booking',
    body: `${customerName} has made a new booking at your shop.`,
    category: NotificationCategory.BOOKING_UPDATE,
  }),
};
