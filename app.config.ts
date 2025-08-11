import 'dotenv/config';

import type { ExpoConfig } from '@expo/config-types';

const config: ExpoConfig = {
  name: 'FadeUp',
  slug: 'fadeup-barber-booking',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'fadeup',
  userInterfaceStyle: 'dark',
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#121212',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.fadeup.barberbooking',
    infoPlist: {
      NSLocationWhenInUseUsageDescription: 'FadeUp needs location access to find nearby barber shops.',
      NSLocationAlwaysAndWhenInUseUsageDescription: 'FadeUp needs location access to find nearby barber shops.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#121212',
    },
    package: 'com.fadeup.barberbooking',
    permissions: [
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'RECEIVE_BOOT_COMPLETED',
      'VIBRATE',
    ],
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-font',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'FadeUp needs location access to find nearby barber shops.',
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/images/icon.png',
        color: '#CB9C5E',
        defaultChannel: 'default',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'FadeUp needs access to your photos to set profile pictures and shop images.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: '7c8b9d2e-1f3a-4b5c-8d7e-9f0a1b2c3d4e', // Replace with your actual EAS project ID
    },
  },
};

export default config;