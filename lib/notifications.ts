import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token = null;

  try {
    // Check if we have permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If we don't have permission, ask for it
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // If we still don't have permission, return null
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return null;
    }

    // On Android, we need to set up a notification channel
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#8B5CF6", // accent-primary
      });
    }

    // Get the token
    const { data: token } = await Notifications.getExpoPushTokenAsync();
    return token;
  } catch (error) {
    console.error("Error getting push token:", error);
    return null;
  }
}

export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data: object = {}
): Promise<void> {
  // This function is typically called from a secure backend (e.g., Firebase Cloud Functions)
  // that retrieves the expoPushToken from the user's UserProfile data in Firestore
  // upon relevant events (e.g., new booking, queue status change).
  // This function is for conceptual demonstration on the client side.
  
  const message = {
    to: expoPushToken,
    sound: "default",
    title,
    body,
    data,
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}