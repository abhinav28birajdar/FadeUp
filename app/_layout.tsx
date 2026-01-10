import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { initializeSupabase } from '../src/config/supabase';
import { analyticsService } from '../src/services/analytics.service';
import { useTheme } from '../src/theme';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const theme = useTheme();

  // Load fonts
  const [loaded] = useFonts({
    // Add custom fonts here when available
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1000);
    
    if (loaded) {
      clearTimeout(timer);
      SplashScreen.hideAsync();
    }

    return () => clearTimeout(timer);
  }, [loaded]);

  useEffect(() => {
    // Initialize Supabase
    initializeSupabase().catch(console.error);
    
    // Initialize analytics
    analyticsService.resetSession();
    analyticsService.trackEvent('app_opened');
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        analyticsService.trackError(error, { errorInfo });
      }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider value={theme.isDark ? DarkTheme : DefaultTheme}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="booking" options={{ headerShown: false }} />
                <Stack.Screen name="shop" options={{ headerShown: false }} />
                <Stack.Screen name="profile" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
              </Stack>
              <StatusBar style={theme.isDark ? 'light' : 'dark'} />
              <Toast />
            </ThemeProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
