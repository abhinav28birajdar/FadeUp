# Google Sign-In Setup Guide

## Overview
This guide will help you set up Google Sign-In for the FadeUp app. You'll need to create OAuth credentials in Google Cloud Console.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

## Step 2: Enable Google Sign-In API

1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Sign-In API" or "Google+ API"
3. Click **Enable**

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** (unless you have a Google Workspace account)
3. Fill in the required information:
   - App name: `FadeUp - Barber Connect`
   - User support email: Your email
   - App domain: Your app's domain (if you have one)
   - Developer contact information: Your email
4. Click **Save and Continue**
5. On the Scopes screen, add these scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`
6. Click **Save and Continue**

## Step 4: Create OAuth Credentials

### For Android:
1. Go to **APIs & Services** > **Credentials**
2. Click **+ Create Credentials** > **OAuth 2.0 Client ID**
3. Select **Android** as the application type
4. Fill in:
   - Name: `FadeUp Android`
   - Package name: `com.fadeup.app` (or your chosen package name)
   - SHA-1 certificate fingerprint: Get this by running:
     ```bash
     # For development (debug keystore)
     keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
     
     # For production (your release keystore)
     keytool -list -v -keystore /path/to/your/release.keystore -alias your_key_alias
     ```
5. Click **Create**
6. Copy the generated Client ID

### For iOS:
1. Click **+ Create Credentials** > **OAuth 2.0 Client ID**
2. Select **iOS** as the application type
3. Fill in:
   - Name: `FadeUp iOS`
   - Bundle ID: `com.fadeup.app` (or your chosen bundle ID)
4. Click **Create**
5. Copy the generated Client ID (this should look like `123456789-abcd1234.apps.googleusercontent.com`)

### For Web (needed for Expo):
1. Click **+ Create Credentials** > **OAuth 2.0 Client ID**
2. Select **Web application** as the application type
3. Fill in:
   - Name: `FadeUp Web`
   - Authorized JavaScript origins: `http://localhost` (for development)
   - Authorized redirect URIs: `http://localhost` (for development)
4. Click **Create**
5. Copy the generated Client ID

## Step 5: Configure Your App

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your `.env` file with the OAuth client IDs:
   ```env
   EXPO_PUBLIC_GOOGLE_SIGNIN_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_SIGNIN_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_SIGNIN_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
   ```

3. Update `app.json` with your iOS client ID:
   ```json
   {
     "expo": {
       "plugins": [
         [
           "@react-native-google-signin/google-signin",
           {
             "iosUrlScheme": "your-ios-client-id.apps.googleusercontent.com"
           }
         ]
       ]
     }
   }
   ```

## Step 6: Firebase Configuration (if using Firebase Auth)

If you're using Firebase Authentication with Google Sign-In:

1. Go to Firebase Console
2. Select your project
3. Go to **Authentication** > **Sign-in method**
4. Enable **Google** as a sign-in provider
5. Add your Web client ID (from Step 4) to Firebase

## Step 7: Test Your Setup

1. Run your app:
   ```bash
   npx expo start --clear
   ```

2. Test Google Sign-In on both Android and iOS

## Troubleshooting

### Common Errors:

**Error: "iosUrlScheme must start with com.googleusercontent.apps"**
- Make sure you're using the actual iOS client ID from Google Cloud Console
- The iOS client ID should look like: `123456789-abcd1234.apps.googleusercontent.com`

**Error: "DEVELOPER_ERROR" on Android**
- Check that your SHA-1 fingerprint is correct
- Make sure your package name matches exactly
- For Expo, you might need to add Expo's fingerprint as well

**Error: "The operation couldn't be completed" on iOS**
- Check that your bundle ID matches the one in Google Cloud Console
- Make sure you're using the correct iOS client ID

**Error: "Access blocked: This app's request is invalid"**
- Complete the OAuth consent screen configuration
- Make sure your app is published (or add test users)

## Development vs Production

### Development:
- Use debug SHA-1 fingerprint for Android
- OAuth consent screen can be in testing mode
- Limited to test users

### Production:
- Use production SHA-1 fingerprint for Android
- OAuth consent screen must be published
- Available to all users

## Additional Resources

- [Google Sign-In Documentation](https://developers.google.com/identity/sign-in/ios)
- [Expo Google Sign-In](https://docs.expo.dev/guides/authentication/#google)
- [Firebase Auth with Google](https://firebase.google.com/docs/auth/web/google-signin)