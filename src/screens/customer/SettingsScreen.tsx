/**
 * Customer Settings Screen
 * Comprehensive settings for customer app
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

// Mock user data
const mockUser = {
  name: 'John Doe',
  email: 'john.doe@email.com',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
};

type SettingItem = {
  icon: string;
  label: string;
  value?: string;
  hasArrow?: boolean;
  onPress?: () => void;
  isToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  danger?: boolean;
};

export const CustomerSettingsScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Settings states
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [reminderNotifications, setReminderNotifications] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(true);
  const [darkMode, setDarkMode] = useState(theme.isDark);
  const [locationServices, setLocationServices] = useState(true);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          router.replace('/auth');
        },
      },
    ]);
  };

  const settingSections = [
    {
      title: 'ACCOUNT',
      items: [
        {
          icon: 'person-outline',
          label: 'Edit Profile',
          hasArrow: true,
          onPress: () => router.push('/profile/edit'),
        },
        {
          icon: 'card-outline',
          label: 'Payment Methods',
          hasArrow: true,
          onPress: () => router.push('/payment-methods'),
        },
        {
          icon: 'heart-outline',
          label: 'Favorites',
          hasArrow: true,
          onPress: () => router.push('/favorites'),
        },
        {
          icon: 'key-outline',
          label: 'Change Password',
          hasArrow: true,
          onPress: () => Alert.alert('Change Password', 'This would navigate to change password screen.'),
        },
      ],
    },
    {
      title: 'NOTIFICATIONS',
      items: [
        {
          icon: 'notifications-outline',
          label: 'Push Notifications',
          isToggle: true,
          toggleValue: pushNotifications,
          onToggle: setPushNotifications,
        },
        {
          icon: 'mail-outline',
          label: 'Email Notifications',
          isToggle: true,
          toggleValue: emailNotifications,
          onToggle: setEmailNotifications,
        },
        {
          icon: 'chatbubble-outline',
          label: 'SMS Notifications',
          isToggle: true,
          toggleValue: smsNotifications,
          onToggle: setSmsNotifications,
        },
        {
          icon: 'alarm-outline',
          label: 'Booking Reminders',
          isToggle: true,
          toggleValue: reminderNotifications,
          onToggle: setReminderNotifications,
        },
        {
          icon: 'megaphone-outline',
          label: 'Promotions & Offers',
          isToggle: true,
          toggleValue: promotionalEmails,
          onToggle: setPromotionalEmails,
        },
      ],
    },
    {
      title: 'PREFERENCES',
      items: [
        {
          icon: 'moon-outline',
          label: 'Dark Mode',
          isToggle: true,
          toggleValue: darkMode,
          onToggle: setDarkMode,
        },
        {
          icon: 'location-outline',
          label: 'Location Services',
          isToggle: true,
          toggleValue: locationServices,
          onToggle: setLocationServices,
        },
        {
          icon: 'language-outline',
          label: 'Language',
          value: 'English',
          hasArrow: true,
          onPress: () => Alert.alert('Language', 'Select language'),
        },
        {
          icon: 'cash-outline',
          label: 'Currency',
          value: 'USD ($)',
          hasArrow: true,
          onPress: () => Alert.alert('Currency', 'Select currency'),
        },
      ],
    },
    {
      title: 'SUPPORT',
      items: [
        {
          icon: 'help-circle-outline',
          label: 'Help Center',
          hasArrow: true,
          onPress: () => Alert.alert('Help Center', 'Opening help center...'),
        },
        {
          icon: 'chatbubbles-outline',
          label: 'Contact Us',
          hasArrow: true,
          onPress: () => Alert.alert('Contact Us', 'Opening contact form...'),
        },
        {
          icon: 'bug-outline',
          label: 'Report a Problem',
          hasArrow: true,
          onPress: () => Alert.alert('Report', 'Opening report form...'),
        },
      ],
    },
    {
      title: 'LEGAL',
      items: [
        {
          icon: 'document-text-outline',
          label: 'Terms of Service',
          hasArrow: true,
          onPress: () => Alert.alert('Terms', 'Opening terms...'),
        },
        {
          icon: 'shield-checkmark-outline',
          label: 'Privacy Policy',
          hasArrow: true,
          onPress: () => Alert.alert('Privacy', 'Opening privacy policy...'),
        },
        {
          icon: 'information-circle-outline',
          label: 'About FadeUp',
          hasArrow: true,
          onPress: () => Alert.alert('About', 'FadeUp v1.0.0'),
        },
      ],
    },
    {
      title: 'ACCOUNT ACTIONS',
      items: [
        {
          icon: 'log-out-outline',
          label: 'Sign Out',
          danger: true,
          onPress: handleSignOut,
        },
      ],
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          Settings
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Card */}
        <TouchableOpacity
          style={[styles.userCard, { backgroundColor: theme.colors.surface }]}
          onPress={() => router.push('/profile/edit')}
        >
          <Image source={{ uri: mockUser.avatar }} style={styles.userAvatar} />
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
              {mockUser.name}
            </Text>
            <Text style={[styles.userEmail, { color: theme.colors.text.muted }]}>
              {mockUser.email}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.text.muted}
          />
        </TouchableOpacity>

        {/* Settings Sections */}
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.muted }]}>
              {section.title}
            </Text>
            <View style={[styles.sectionContent, { backgroundColor: theme.colors.surface }]}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex !== section.items.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.neutral[100],
                    },
                  ]}
                  onPress={item.onPress}
                  disabled={item.isToggle}
                >
                  <View style={styles.settingLeft}>
                    <View
                      style={[
                        styles.iconWrapper,
                        {
                          backgroundColor: item.danger
                            ? theme.colors.error[50]
                            : theme.colors.neutral[100],
                        },
                      ]}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={20}
                        color={
                          item.danger
                            ? theme.colors.error[500]
                            : theme.colors.text.secondary
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.settingLabel,
                        {
                          color: item.danger
                            ? theme.colors.error[500]
                            : theme.colors.text.primary,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <View style={styles.settingRight}>
                    {item.value && (
                      <Text style={[styles.settingValue, { color: theme.colors.text.muted }]}>
                        {item.value}
                      </Text>
                    )}
                    {item.isToggle && (
                      <Switch
                        value={item.toggleValue}
                        onValueChange={item.onToggle}
                        trackColor={{
                          false: theme.colors.neutral[300],
                          true: theme.colors.primary[400],
                        }}
                        thumbColor={
                          item.toggleValue
                            ? theme.colors.primary[600]
                            : theme.colors.neutral[100]
                        }
                      />
                    )}
                    {item.hasArrow && (
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={theme.colors.text.muted}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* App Version */}
        <Text style={[styles.versionText, { color: theme.colors.text.muted }]}>
          FadeUp v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionContent: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 15,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
  },
  versionText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default CustomerSettingsScreen;
