/**
 * Barber Settings Screen
 * App settings, notifications, account management
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

interface SettingItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  route?: string;
  type: 'link' | 'toggle' | 'action';
  value?: boolean;
  badge?: string;
  danger?: boolean;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

const mockUser = {
  name: 'Mike Anderson',
  email: 'mike@barbershop.com',
  phone: '+1 (555) 123-4567',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  role: 'Shop Owner',
  shopName: "Mike's Barber Shop",
};

export const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);

  const settingSections: SettingSection[] = [
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          icon: 'person-outline',
          label: 'Personal Information',
          description: 'Name, email, phone number',
          route: '/settings/profile',
          type: 'link',
        },
        {
          id: 'shop',
          icon: 'storefront-outline',
          label: 'Shop Profile',
          description: 'Business details, hours, services',
          route: '/barber/shop-profile',
          type: 'link',
        },
        {
          id: 'security',
          icon: 'shield-outline',
          label: 'Security',
          description: 'Password, 2FA',
          route: '/settings/security',
          type: 'link',
        },
        {
          id: 'payment',
          icon: 'card-outline',
          label: 'Payment Methods',
          description: 'Payout settings, bank accounts',
          route: '/settings/payment',
          type: 'link',
          badge: '2',
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'push',
          icon: 'notifications-outline',
          label: 'Push Notifications',
          type: 'toggle',
          value: pushNotifications,
        },
        {
          id: 'email',
          icon: 'mail-outline',
          label: 'Email Notifications',
          type: 'toggle',
          value: emailNotifications,
        },
        {
          id: 'sms',
          icon: 'chatbubble-outline',
          label: 'SMS Notifications',
          type: 'toggle',
          value: smsNotifications,
        },
        {
          id: 'sound',
          icon: 'volume-high-outline',
          label: 'Sound',
          type: 'toggle',
          value: soundEnabled,
        },
        {
          id: 'vibration',
          icon: 'phone-portrait-outline',
          label: 'Vibration',
          type: 'toggle',
          value: vibrationEnabled,
        },
      ],
    },
    {
      title: 'Queue Settings',
      items: [
        {
          id: 'autoaccept',
          icon: 'checkmark-circle-outline',
          label: 'Auto-accept Bookings',
          description: 'Automatically confirm new bookings',
          type: 'toggle',
          value: autoAccept,
        },
        {
          id: 'queueLimit',
          icon: 'people-outline',
          label: 'Queue Limit',
          description: 'Set maximum queue size',
          route: '/settings/queue-limit',
          type: 'link',
        },
        {
          id: 'availability',
          icon: 'calendar-outline',
          label: 'Availability Schedule',
          description: 'Set your working hours',
          route: '/settings/availability',
          type: 'link',
        },
      ],
    },
    {
      title: 'App Preferences',
      items: [
        {
          id: 'darkMode',
          icon: 'moon-outline',
          label: 'Dark Mode',
          type: 'toggle',
          value: darkMode,
        },
        {
          id: 'location',
          icon: 'location-outline',
          label: 'Location Services',
          type: 'toggle',
          value: locationEnabled,
        },
        {
          id: 'language',
          icon: 'language-outline',
          label: 'Language',
          description: 'English (US)',
          route: '/settings/language',
          type: 'link',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          icon: 'help-circle-outline',
          label: 'Help Center',
          route: '/settings/help',
          type: 'link',
        },
        {
          id: 'contact',
          icon: 'chatbubbles-outline',
          label: 'Contact Support',
          route: '/settings/contact',
          type: 'link',
        },
        {
          id: 'terms',
          icon: 'document-text-outline',
          label: 'Terms of Service',
          route: '/settings/terms',
          type: 'link',
        },
        {
          id: 'privacy',
          icon: 'lock-closed-outline',
          label: 'Privacy Policy',
          route: '/settings/privacy',
          type: 'link',
        },
      ],
    },
    {
      title: 'Danger Zone',
      items: [
        {
          id: 'logout',
          icon: 'log-out-outline',
          label: 'Log Out',
          type: 'action',
          danger: true,
        },
        {
          id: 'delete',
          icon: 'trash-outline',
          label: 'Delete Account',
          type: 'action',
          danger: true,
        },
      ],
    },
  ];

  const handleToggle = (id: string, value: boolean) => {
    switch (id) {
      case 'push':
        setPushNotifications(value);
        break;
      case 'email':
        setEmailNotifications(value);
        break;
      case 'sms':
        setSmsNotifications(value);
        break;
      case 'sound':
        setSoundEnabled(value);
        break;
      case 'vibration':
        setVibrationEnabled(value);
        break;
      case 'darkMode':
        setDarkMode(value);
        break;
      case 'location':
        setLocationEnabled(value);
        break;
      case 'autoaccept':
        setAutoAccept(value);
        break;
    }
  };

  const handleAction = (id: string) => {
    switch (id) {
      case 'logout':
        Alert.alert(
          'Log Out',
          'Are you sure you want to log out?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Log Out',
              style: 'destructive',
              onPress: () => router.replace('/auth'),
            },
          ]
        );
        break;
      case 'delete':
        Alert.alert(
          'Delete Account',
          'Are you sure you want to delete your account? This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => console.log('Delete account'),
            },
          ]
        );
        break;
    }
  };

  const getToggleValue = (id: string): boolean => {
    switch (id) {
      case 'push':
        return pushNotifications;
      case 'email':
        return emailNotifications;
      case 'sms':
        return smsNotifications;
      case 'sound':
        return soundEnabled;
      case 'vibration':
        return vibrationEnabled;
      case 'darkMode':
        return darkMode;
      case 'location':
        return locationEnabled;
      case 'autoaccept':
        return autoAccept;
      default:
        return false;
    }
  };

  const renderUserHeader = () => (
    <TouchableOpacity
      style={[styles.userHeader, { backgroundColor: theme.colors.surface }]}
      onPress={() => router.push('/settings/profile')}
      activeOpacity={0.8}
    >
      <Image source={{ uri: mockUser.avatar }} style={styles.userAvatar} />
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
          {mockUser.name}
        </Text>
        <Text style={[styles.userRole, { color: theme.colors.text.secondary }]}>
          {mockUser.role}
        </Text>
        <Text style={[styles.userShop, { color: theme.colors.text.muted }]}>
          {mockUser.shopName}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={theme.colors.text.muted}
      />
    </TouchableOpacity>
  );

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.settingItem,
        item.type === 'toggle' && styles.settingItemNoPress,
      ]}
      onPress={() => {
        if (item.type === 'link' && item.route) {
          router.push(item.route as any);
        } else if (item.type === 'action') {
          handleAction(item.id);
        }
      }}
      activeOpacity={item.type === 'toggle' ? 1 : 0.7}
    >
      <View
        style={[
          styles.settingIcon,
          {
            backgroundColor: item.danger
              ? theme.colors.error[50]
              : theme.colors.neutral[100],
          },
        ]}
      >
        <Ionicons
          name={item.icon}
          size={20}
          color={item.danger ? theme.colors.error[500] : theme.colors.text.secondary}
        />
      </View>
      <View style={styles.settingContent}>
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
        {item.description && (
          <Text
            style={[styles.settingDescription, { color: theme.colors.text.muted }]}
          >
            {item.description}
          </Text>
        )}
      </View>
      {item.type === 'toggle' && (
        <Switch
          value={getToggleValue(item.id)}
          onValueChange={(value) => handleToggle(item.id, value)}
          trackColor={{
            false: theme.colors.neutral[200],
            true: theme.colors.primary[500],
          }}
          thumbColor="#FFFFFF"
        />
      )}
      {item.type === 'link' && (
        <View style={styles.linkRight}>
          {item.badge && (
            <View
              style={[
                styles.badge,
                { backgroundColor: theme.colors.primary[500] },
              ]}
            >
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.text.muted}
          />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderSection = (section: SettingSection, index: number) => (
    <View key={section.title} style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.muted }]}>
        {section.title}
      </Text>
      <View style={[styles.sectionContent, { backgroundColor: theme.colors.surface }]}>
        {section.items.map((item, itemIndex) => (
          <View key={item.id}>
            {renderSettingItem(item)}
            {itemIndex < section.items.length - 1 && (
              <View
                style={[
                  styles.divider,
                  { backgroundColor: theme.colors.neutral[100] },
                ]}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );

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
          <Ionicons
            name="chevron-back"
            size={24}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Settings
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Header */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          {renderUserHeader()}
        </View>

        {/* Settings Sections */}
        {settingSections.map((section, index) => renderSection(section, index))}

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: theme.colors.text.muted }]}>
            FadeUp for Barbers v1.0.0
          </Text>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    marginBottom: 2,
  },
  userShop: {
    fontSize: 13,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 4,
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
    padding: 16,
  },
  settingItemNoPress: {
    paddingRight: 12,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  linkRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginLeft: 64,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 13,
  },
});

export default SettingsScreen;
