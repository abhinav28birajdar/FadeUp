import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
    useFonts,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold
} from '@expo-google-fonts/inter';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuthContext } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { Toast } from '../components/ui/Toast';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { Colors } from '../constants/colors';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
    const { isAuthenticated, isLoading, role, hasSeenOnboarding } = useAuthContext();
    useNotifications(); // Initialize notifications
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading || hasSeenOnboarding === null) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inOnboardingGroup = segments[0] === 'onboarding';

        if (!hasSeenOnboarding && !inOnboardingGroup) {
            router.replace('/onboarding/slide1');
        } else if (hasSeenOnboarding && !isAuthenticated && !inAuthGroup && !inOnboardingGroup) {
            router.replace('/(auth)/welcome');
        } else if (isAuthenticated) {
            const isBarber = role === 'barber' || role === 'shop_owner';
            const isAdmin = role === 'admin';

            const inTabsGroup = segments[0] === '(tabs)';
            const inBarberGroup = segments[0] === '(barber)';
            const inAdminGroup = segments[0] === 'admin';

            if (isAdmin && !inAdminGroup) {
                router.replace('/admin/dashboard');
            } else if (isBarber && !inBarberGroup && !inAdminGroup) {
                router.replace('/(barber)/dashboard');
            } else if (role === 'customer' && !inTabsGroup && !inAuthGroup && !inBarberGroup && !inAdminGroup) {
                // Only redirect to tabs if not already navigating somewhere allowed for customers like chat
                // We will default to home if they are coming from auth
                if (inAuthGroup || segments.length <= 0) {
                    router.replace('/(tabs)/home');
                }
            }
        }
    }, [isAuthenticated, isLoading, segments, hasSeenOnboarding, role]);

    return <Slot />;
}

export default function RootLayout() {
    const [fontsLoaded, fontError] = useFonts({
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold
    });

    useEffect(() => {
        if (fontError) throw fontError;
    }, [fontError]);

    return (
        <ErrorBoundary>
            <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.background }}>
                <SafeAreaProvider>
                    <AuthProvider>
                        <StatusBar style="light" />
                        <RootLayoutManager fontsLoaded={fontsLoaded} />
                        <Toast />
                    </AuthProvider>
                </SafeAreaProvider>
            </GestureHandlerRootView>
        </ErrorBoundary>
    );
}

function RootLayoutManager({ fontsLoaded }: { fontsLoaded: boolean }) {
    const { isLoading } = useAuthContext();

    useEffect(() => {
        if (fontsLoaded && !isLoading) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, isLoading]);

    if (!fontsLoaded || isLoading) {
        return null;
    }

    return <RootLayoutNav />;
}
