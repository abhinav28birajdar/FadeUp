import { Stack } from 'expo-router';
import React from 'react';
import { useTheme } from '../../src/theme';

export default function BookingLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="services" />
      <Stack.Screen name="barber" />
      <Stack.Screen name="datetime" />
      <Stack.Screen name="confirm" />
      <Stack.Screen 
        name="success" 
        options={{
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
