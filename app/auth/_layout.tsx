/**
 * Auth Layout - Stack Navigator for Authentication Flow
 */

import { Stack } from 'expo-router';
import React from 'react';
import { useTheme } from '../../src/theme';

export default function AuthLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="user-type" />
      <Stack.Screen name="signin" />
      <Stack.Screen name="customer-signup" />
      <Stack.Screen name="barber-signup" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="email-verification" />
      <Stack.Screen name="phone-verification" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}