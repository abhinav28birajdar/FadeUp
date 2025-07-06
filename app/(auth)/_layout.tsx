import { Stack } from 'expo-router';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function AuthLayout() {
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#121212', '#1A1A1A', '#242424']}
        style={{ flex: 1, position: 'absolute', width: '100%', height: '100%' }}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen name="role-select" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
    </View>
  );
}