import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack, router } from 'expo-router';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import * as SplashScreen from 'expo-splash-screen';

import { auth, db } from '@/src/lib/firebase';
import { useAuthStore } from '@/src/store/authStore';
import { UserProfile } from '@/src/types/firebaseModels';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { firebaseUser, user, role, setFirebaseUser, setUser, clearAuth } = useAuthStore();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setFirebaseUser(authUser);
      
      if (authUser) {
        try {
          // Fetch user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', authUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as Omit<UserProfile, 'id'>;
            setUser({
              id: authUser.uid,
              ...userData,
            } as UserProfile);
          } else {
            // User exists in Auth but not in Firestore
            console.warn('User profile not found in Firestore');
            auth.signOut();
            clearAuth();
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          clearAuth();
        }
      } else {
        // User is signed out
        clearAuth();
      }
      
      setAppReady(true);
    });

    return () => unsubscribe();
  }, [clearAuth, setFirebaseUser, setUser]);

  useEffect(() => {
    if (appReady) {
      // Hide splash screen once auth is determined
      SplashScreen.hideAsync();
      
      // Redirect based on authentication state
      if (firebaseUser && user) {
        if (role === 'customer') {
          router.replace('/(customer)/home');
        } else if (role === 'shopkeeper') {
          router.replace('/(shopkeeper)/dashboard');
        }
      } else {
        router.replace('/(auth)/role-select');
      }
    }
  }, [appReady, firebaseUser, user, role, clearAuth, setFirebaseUser, setUser]);

  if (!appReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#121212', '#1A1A1A', '#242424']}
        style={{ flex: 1, position: 'absolute', width: '100%', height: '100%' }}
      />
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen 
          name="(customer)" 
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="(shopkeeper)" 
          options={{ 
            headerShown: false,
          }}
        />
      </Stack>
    </View>
  );
}