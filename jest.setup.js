// Jest setup file
import 'react-native-gesture-handler/jestSetup';

// Mock Expo modules
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      EXPO_PUBLIC_SUPABASE_URL: 'mock-url',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: 'mock-key',
    },
  },
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
  },
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
  },
}));

// Mock Supabase
jest.mock('../src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  const MapView = (props) => React.createElement(View, props, props.children);
  MapView.Marker = (props) => React.createElement(View, props, props.children);
  MapView.Callout = (props) => React.createElement(View, props, props.children);
  
  return MapView;
});
