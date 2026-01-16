import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SupabaseAuthService } from '../services/supabase/auth.service';
import { useAuthStore } from '../store/authStore';
import { useTheme, useThemeStore } from '../theme';

export const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const { mode, setMode } = useThemeStore();
  const { user, logout } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [locationEnabled, setLocationEnabled] = React.useState(true);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await SupabaseAuthService.signOut();
              logout();
              router.replace('/auth/login');
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleThemeChange = (newMode: 'light' | 'dark' | 'system') => {
    setMode(newMode);
  };

  const renderSettingItem = (
    icon: keyof typeof Ionicons.glyphMap,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        { borderBottomColor: theme.colors.border },
      ]}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View style={styles.settingLeft}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.colors.primary[100] },
          ]}
        >
          <Ionicons name={icon} size={20} color={theme.colors.primary[500]} />
        </View>
        <View style={styles.settingText}>
          <Text
            style={[
              styles.settingTitle,
              {
                color: theme.colors.text.primary,
                fontFamily: theme.typography.fontFamily.medium,
              },
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.settingSubtitle,
                {
                  color: theme.colors.text.secondary,
                  fontFamily: theme.typography.fontFamily.regular,
                },
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightElement || (
        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.muted} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.text.primary,
              fontFamily: theme.typography.fontFamily.bold,
            },
          ]}
        >
          Settings
        </Text>
      </View>

      <Card variant="elevated" padding="none" style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.colors.text.secondary,
              fontFamily: theme.typography.fontFamily.semibold,
            },
          ]}
        >
          ACCOUNT
        </Text>
        {renderSettingItem(
          'person-outline',
          'Edit Profile',
          user?.full_name || user?.email,
          () => router.push('/profile/edit')
        )}
        {renderSettingItem(
          'lock-closed-outline',
          'Change Password',
          undefined,
          () => router.push('/auth/change-password')
        )}
      </Card>

      <Card variant="elevated" padding="none" style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.colors.text.secondary,
              fontFamily: theme.typography.fontFamily.semibold,
            },
          ]}
        >
          PREFERENCES
        </Text>
        {renderSettingItem(
          'moon-outline',
          'Theme',
          mode === 'system' ? 'System Default' : mode === 'dark' ? 'Dark' : 'Light',
          () => {
            Alert.alert('Select Theme', '', [
              {
                text: 'Light',
                onPress: () => handleThemeChange('light'),
              },
              {
                text: 'Dark',
                onPress: () => handleThemeChange('dark'),
              },
              {
                text: 'System Default',
                onPress: () => handleThemeChange('system'),
              },
              { text: 'Cancel', style: 'cancel' },
            ]);
          }
        )}
        {renderSettingItem(
          'notifications-outline',
          'Notifications',
          'Receive queue and booking updates',
          undefined,
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{
              false: theme.colors.gray[300],
              true: theme.colors.primary[500],
            }}
          />
        )}
        {renderSettingItem(
          'location-outline',
          'Location Services',
          'Find nearby barbershops',
          undefined,
          <Switch
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            trackColor={{
              false: theme.colors.gray[300],
              true: theme.colors.primary[500],
            }}
          />
        )}
      </Card>

      <Card variant="elevated" padding="none" style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.colors.text.secondary,
              fontFamily: theme.typography.fontFamily.semibold,
            },
          ]}
        >
          SUPPORT
        </Text>
        {renderSettingItem(
          'help-circle-outline',
          'Help Center',
          undefined,
          () => {}
        )}
        {renderSettingItem(
          'document-text-outline',
          'Terms of Service',
          undefined,
          () => {}
        )}
        {renderSettingItem(
          'shield-checkmark-outline',
          'Privacy Policy',
          undefined,
          () => {}
        )}
        {renderSettingItem(
          'mail-outline',
          'Contact Us',
          undefined,
          () => {}
        )}
      </Card>

      <Card variant="elevated" padding="none" style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.colors.text.secondary,
              fontFamily: theme.typography.fontFamily.semibold,
            },
          ]}
        >
          ABOUT
        </Text>
        {renderSettingItem(
          'information-circle-outline',
          'App Version',
          '1.0.0'
        )}
      </Card>

      <View style={styles.logoutContainer}>
        <Button variant="danger" onPress={handleLogout} fullWidth>
          Logout
        </Button>
      </View>

      <Text
        style={[
          styles.footer,
          {
            color: theme.colors.text.muted,
            fontFamily: theme.typography.fontFamily.regular,
          },
        ]}
      >
        Made with ❤️ by FadeUp Team
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
  },
  logoutContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  footer: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
