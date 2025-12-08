// Push notifications service
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export class PushNotificationService {
  private static instance: PushNotificationService;

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  async requestPermissions() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  }

  async configureNotificationChannels() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('queue', {
        name: 'Queue Updates',
        importance: Notifications.AndroidImportance.HIGH,
      });
      
      await Notifications.setNotificationChannelAsync('booking', {
        name: 'Booking Updates',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
  }

  async getExpoPushToken() {
    try {
      const token = await Notifications.getExpoPushTokenAsync();
      return token.data;
    } catch (error) {
      console.warn('Failed to get push token:', error);
      return null;
    }
  }

  async registerForPushNotifications(): Promise<string | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      return null;
    }
    
    return await this.getExpoPushToken();
  }

  addNotificationReceivedListener(listener: (notification: any) => void) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  addNotificationResponseReceivedListener(listener: (response: any) => void) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }

  async sendLocalNotification(title: string, body: string, data?: any) {
    await this.schedulePushNotification(title, body, data);
  }

  async clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
  }

  async schedulePushNotification(title: string, body: string, data?: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: { 
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1 
      },
    });
  }
}

// Export singleton instance
export const pushNotificationService = PushNotificationService.getInstance();