import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Sign In' }} />
      <Stack.Screen name="register" options={{ title: 'Sign Up' }} />
      <Stack.Screen name="role-select" options={{ title: 'Select Role' }} />
      <Stack.Screen name="complete-profile" options={{ title: 'Complete Profile' }} />
      <Stack.Screen name="verify-otp" options={{ title: 'Verify Code' }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
    </Stack>
  );
}