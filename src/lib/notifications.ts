import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Register for push notifications and return the token
 * @returns ExpoPushToken or null if registration failed
 */
export async function registerForPushNotificationsAsync() {
  // Check if we're running on a physical device
  if (Platform.OS === 'web') {
    console.log('Push notifications are not supported on web');
    return null;
  }

  // Request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }
  
  // Create notification channel for Android
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#8B5CF6', // accent-primary
    });
  }
  
  // Get the token
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

/**
 * Send a push notification
 * Note: This should ideally be triggered by a Firebase Cloud Function (server-side)
 * This implementation is for demonstration purposes only
 */
export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data: object = {}
) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data,
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}