import { useEffect } from 'react';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/colors';

export default function Index() {
    const router = useRouter();
    const { isAuthenticated, user, isLoading } = useAuth();
    const rootNavigationState = useRootNavigationState();

    useEffect(() => {
        if (!rootNavigationState?.key || isLoading) return;

        if (isAuthenticated && user) {
            if (user.type === 'barber') {
                router.replace('/(barber)/dashboard');
            } else {
                router.replace('/(tabs)/home');
            }
        } else {
            // Check for onboarding status in reality, but for UI demo we go to welcome
            router.replace('/onboarding/welcome');
        }
    }, [isAuthenticated, user, isLoading, rootNavigationState]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
            <ActivityIndicator size="large" color={Colors.primary} />
        </View>
    );
}
