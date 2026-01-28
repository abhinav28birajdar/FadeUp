import { Stack } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function AuthLayout() {
    return (
        <Stack screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background }
        }}>
            <Stack.Screen name="welcome" />
            <Stack.Screen name="user-choice" options={{ presentation: 'card', animation: 'slide_from_right' }} />
            <Stack.Screen name="sign-in" options={{ presentation: 'card', animation: 'slide_from_right' }} />
            <Stack.Screen name="sign-up-customer" options={{ presentation: 'card', animation: 'slide_from_right' }} />
            <Stack.Screen name="sign-up-barber" options={{ presentation: 'card', animation: 'slide_from_right' }} />
            <Stack.Screen name="forgot-password" options={{ presentation: 'modal' }} />
        </Stack>
    );
}
