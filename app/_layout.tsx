import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';

import '../global.css';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  
  const [appReady, setAppReady] = useState(false);
  const { session, user, role, setSession, setUser, setRole, clearAuth } = useAuthStore();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Supabase Auth State Management
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleAuthSession(session);
      } else {
        clearAuth();
        setAppReady(true);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        await handleAuthSession(session);
      } else {
        clearAuth();
        setAppReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSession = async (session: any) => {
    try {
      setSession(session);
      
      // Fetch user profile
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || !userProfile) {
        // Profile doesn't exist, sign out
        await supabase.auth.signOut();
        clearAuth();
      } else {
        setUser(userProfile);
        setRole(userProfile.role);
      }
    } catch (error) {
      console.error('Error handling auth session:', error);
      await supabase.auth.signOut();
      clearAuth();
    } finally {
      setAppReady(true);
    }
  };

  // Conditional routing after app is ready
  useEffect(() => {
    if (appReady) {
      if (session && user && role !== 'unauthenticated') {
        // Authenticated user - redirect to appropriate dashboard
        if (role === 'customer') {
          router.replace('/(customer)/home');
        } else if (role === 'shopkeeper') {
          router.replace('/(shopkeeper)/dashboard');
        }
      } else {
        // Unauthenticated - redirect to role selection
        router.replace('/(auth)/role-select');
      }
    }
  }, [appReady, session, user, role]);

  if (!loaded || !appReady) {
    return null;
  }

  return (
    <LinearGradient
      colors={['#121212', '#1a1a1a']}
      style={{ flex: 1 }}
    >
      <ThemeProvider value={DarkTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen 
            name="(auth)" 
            options={{ animation: 'fade' }}
          />
          {session && user && role === 'customer' && (
            <Stack.Screen 
              name="(customer)" 
              options={{ animation: 'fade' }}
            />
          )}
          {session && user && role === 'shopkeeper' && (
            <Stack.Screen 
              name="(shopkeeper)" 
              options={{ animation: 'fade' }}
            />
          )}
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </LinearGradient>
  );
}
