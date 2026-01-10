import { Stack } from 'expo-router';
import React from 'react';
import { useTheme } from '../../src/theme';

export default function ProfileLayout() {
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
      <Stack.Screen name="edit" />
    </Stack>
  );
}
