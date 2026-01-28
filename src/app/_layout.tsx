import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { Colors } from '../constants/colors';
import { View } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded] = useFonts({
        // Load custom fonts here if we had them. utilizing system fonts for now or google fonts later if added.
    });

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);



    // Custom Dark Theme
    const MyDarkTheme = {
        ...DarkTheme,
        colors: {
            ...DarkTheme.colors,
            background: Colors.background,
            card: Colors.surface,
            text: Colors.text,
            border: Colors.border,
            primary: Colors.primary,
        },
    };

    return (
        <ThemeProvider value={MyDarkTheme}>
            <AuthProvider>
                <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="(barber)" options={{ headerShown: false }} />
                    <Stack.Screen name="chat" options={{ headerShown: false }} />
                    <Stack.Screen name="settings" options={{ headerShown: false }} />
                    <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
                    <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar style="light" />
            </AuthProvider>
        </ThemeProvider>
    );
}
