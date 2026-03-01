# FadeUp — Final Production Standalone

Premium, production-ready barbershop platform for Customers, Barbers, and Admins. Built with **React Native**, **Expo**, and **Firebase**.

## 🚀 Setup Instructions

### 1. Firebase Configuration
Before running the application, you must set up a Firebase project and obtain the client configuration:

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project named `FadeUp`.
3.  **Authentication:** Enable **Email/Password** authentication.
4.  **Firestore Database:**
    *   Initialize in **Production Mode**.
    *   Deploy the provided `firestore.rules`.
5.  **Storage:**
    *   Initialize Storage.
    *   Deploy the provided `storage.rules`.
6.  **Web App Configuration:**
    *   Add a Web App (`FadeUp Web`).
    *   Copy the `firebaseConfig` keys and paste them into your `.env` file (see `.env.example`).
7.  **Android/iOS Configuration (Optional for Expo Go, Mandatory for Builds):**
    *   Add an Android app with package `com.fadeup.app`.
    *   Download `google-services.json` and place it in the project root.
    *   Add an iOS app with bundle ID `com.fadeup.app`.
    *   Download `GoogleService-Info.plist` and place it in the root (update `app.json` accordingly if needed).

### 2. Environment Variables
Create a `.env` file in the root directory and populate it with your Firebase keys:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Installation & Start
```bash
# Install dependencies
npm install

# Start the Expo development server
npx expo start --clear
```

## 🛠️ Tech Stack
- **Framework:** Expo SDK 54 / React Native 0.81
- **Navigation:** Expo Router v6 (File-based)
- **Backend:** Firebase (Auth, Firestore, Storage)
- **State Management:** Zustand
- **Animations:** React Native Reanimated v4
- **Icons:** Lucide React Native
- **Push Notifications:** Expo Notifications

## 📋 Features
- **Discovery:** Browse shops, filter by category, real-time availability.
- **Real-Time Queue:** Live wait times and position tracking for clients.
- **Barber Dashboard:** Manage incoming queue, view earnings, manage services.
- **Admin Console:** Approve new shops, manage users, platform analytics.
- **Chat:** Built-in real-time messaging between customers and shops.

## ⚠️ Known Removals
See `REMOVED_FEATURES.md` for a list of features intentionally excluded to ensure full compatibility with the Expo managed workflow and Firebase JS SDK.
