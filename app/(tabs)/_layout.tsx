/**
 * Tab Layout
 * Dynamic tab navigation based on user role (customer vs barber)
 */

import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { useTheme } from '@/src/theme';

// Mock user role - in production, get from auth context
const USER_ROLE: 'customer' | 'barber' = 'customer';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  name: string;
  title: string;
  icon: IconName;
  iconFocused: IconName;
}

const customerTabs: TabConfig[] = [
  { name: 'index', title: 'Home', icon: 'home-outline', iconFocused: 'home' },
  { name: 'explore', title: 'Explore', icon: 'search-outline', iconFocused: 'search' },
  { name: 'bookings', title: 'Bookings', icon: 'calendar-outline', iconFocused: 'calendar' },
  { name: 'queue', title: 'Queue', icon: 'people-outline', iconFocused: 'people' },
  { name: 'profile', title: 'Profile', icon: 'person-outline', iconFocused: 'person' },
];

const barberTabs: TabConfig[] = [
  { name: 'index', title: 'Dashboard', icon: 'grid-outline', iconFocused: 'grid' },
  { name: 'queue', title: 'Queue', icon: 'people-outline', iconFocused: 'people' },
  { name: 'bookings', title: 'Bookings', icon: 'calendar-outline', iconFocused: 'calendar' },
  { name: 'earnings', title: 'Earnings', icon: 'cash-outline', iconFocused: 'cash' },
  { name: 'profile', title: 'Profile', icon: 'person-outline', iconFocused: 'person' },
];

// Tabs to hide based on user role
const hiddenTabsCustomer = ['earnings', 'settings', 'chat'];
const hiddenTabsBarber = ['explore', 'settings', 'chat'];

export default function TabLayout() {
  const theme = useTheme();

  const activeTabs = USER_ROLE === 'customer' ? customerTabs : barberTabs;
  const hiddenTabs = USER_ROLE === 'customer' ? hiddenTabsCustomer : hiddenTabsBarber;

  const getTabConfig = (tabName: string) => {
    return activeTabs.find((tab) => tab.name === tabName);
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary[500],
        tabBarInactiveTintColor: theme.colors.text.muted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.neutral[200],
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: getTabConfig('index')?.title || 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? getTabConfig('index')?.iconFocused || 'home' : getTabConfig('index')?.icon || 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          href: USER_ROLE === 'barber' ? null : undefined,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'search' : 'search-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'calendar' : 'calendar-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="queue"
        options={{
          title: 'Queue',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'people' : 'people-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          href: null, // Hide from tab bar, accessible via navigation
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'chatbubble' : 'chatbubble-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Earnings',
          href: USER_ROLE === 'customer' ? null : undefined,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'cash' : 'cash-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          href: null, // Hide from tab bar, accessible via profile
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
