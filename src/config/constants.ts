export const APP_CONFIG = {
  name: 'FadeUp',
  version: '1.0.0',
  description: 'Real-time barber queue and booking app',
  defaultLocation: {
    latitude: 37.7749,
    longitude: -122.4194, // San Francisco
  },
  searchRadius: 25, // kilometers
  maxWaitingCustomers: 20,
  estimatedServiceBuffer: 5, // minutes
};

export const QUEUE_CONFIG = {
  maxQueueLength: 20,
  estimatedWaitBuffer: 5, // minutes
  refreshInterval: 5000, // milliseconds
  positionUpdateThreshold: 30000, // milliseconds
};

export const NOTIFICATION_CONFIG = {
  queuePositionUpdate: true,
  serviceStarted: true,
  bookingConfirmed: true,
  reminderMinutes: [60, 15], // minutes before appointment
};

export const VALIDATION_CONFIG = {
  minPasswordLength: 6,
  maxShopNameLength: 50,
  maxServiceNameLength: 30,
  maxDescriptionLength: 200,
  phoneRegex: /^[\+]?[1-9][\d]{0,15}$/,
  emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

export const UI_CONFIG = {
  colors: {
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    secondary: '#F59E0B',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    border: '#E5E7EB',
    text: '#111827',
    textSecondary: '#6B7280',
    textLight: '#9CA3AF',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 50,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
};