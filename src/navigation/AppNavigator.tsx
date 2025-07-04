// src/navigation/AppNavigator.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Recommended for simple stack nav
import { ActivityIndicator, View } from 'react-native';

import { useAppStore } from '../store';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';

// Import all your screens
import RoleSelectScreen from '../screens/RoleSelectScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/customer/HomeScreen';
import ShopkeeperDashboardScreen from '../screens/shopkeeper/ShopkeeperDashboardScreen';
import ShopDetailsScreen from '../screens/customer/ShopDetailsScreen';
import ServiceDetailsScreen from '../screens/customer/ServiceDetailsScreen';
import BookSlotScreen from '../screens/customer/BookSlotScreen';
import BookingConfirmationScreen from '../screens/customer/BookingConfirmationScreen';
import CustomerQueueScreen from '../screens/customer/QueueScreen';
import BookingDetailsScreen from '../screens/shopkeeper/BookingDetailsScreen';
import ShopkeeperQueueScreen from '../screens/shopkeeper/ShopQueueScreen';
import FeedbackListScreen from '../screens/shopkeeper/FeedbackListScreen';
import FeedbackDetailsScreen from '../screens/shopkeeper/FeedbackDetailsScreen';

// Define route parameter types
export type RootStackParamList = {
  RoleSelect: undefined;
  Auth: undefined; // Generic for nested auth stack
  Login: undefined;
  Register: undefined;
  Home: undefined; // Customer Home
  ShopkeeperDashboard: undefined;
  ShopDetails: { shopId: string };
  ServiceDetails: { serviceId: string; shopId: string; }; // Pass shopId for context
  BookSlot: { shopId: string; selectedServiceIds?: string[] };
  BookingConfirmation: { bookingId: string };
  CustomerQueue: undefined;
  BookingDetails: { bookingId: string }; // Shopkeeper booking detail
  ShopkeeperQueue: undefined;
  FeedbackList: undefined;
  FeedbackDetails: { feedbackId: string };
  // Add other routes as you implement them
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { userRole, setUserRole, currentUser, setCurrentUser } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null); // Supabase session type

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
        setCurrentUser(null);
      }
      setLoading(false); // Make sure loading is false after auth state changes
    });
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role, shop_id, email')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (data) {
        setUserRole(data.role as UserRole);
        setCurrentUser({
          id: userId,
          email: data.email,
          role: data.role as UserRole,
          shop_id: data.shop_id,
          // Add other user fields as needed
        });
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      // Handle error, maybe sign out
      supabase.auth.signOut();
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={!session ? 'RoleSelect' : (userRole === 'customer' ? 'Home' : 'ShopkeeperDashboard')}
        screenOptions={{
          headerShown: false, // Hide header by default
          contentStyle: { backgroundColor: 'transparent' } // Allows glassmorphism to show through
        }}
      >
        {!session ? (
          // No user session: show role select, login/register
          <Stack.Group>
            <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Group>
        ) : userRole === 'customer' ? (
          // Customer screens
          <Stack.Group>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="ShopDetails" component={ShopDetailsScreen} />
            <Stack.Screen name="ServiceDetails" component={ServiceDetailsScreen} />
            <Stack.Screen name="BookSlot" component={BookSlotScreen} />
            <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
            <Stack.Screen name="CustomerQueue" component={CustomerQueueScreen} />
          </Stack.Group>
        ) : userRole === 'shopkeeper' ? (
          // Shopkeeper screens
          <Stack.Group>
            <Stack.Screen name="ShopkeeperDashboard" component={ShopkeeperDashboardScreen} />
            <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
            <Stack.Screen name="ShopkeeperQueue" component={ShopkeeperQueueScreen} />
            <Stack.Screen name="FeedbackList" component={FeedbackListScreen} />
            <Stack.Screen name="FeedbackDetails" component={FeedbackDetailsScreen} />
          </Stack.Group>
        ) : (
          // Fallback or loading state if role not determined after session
          <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;