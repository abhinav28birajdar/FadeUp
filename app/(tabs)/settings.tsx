import { ThemedText } from '@/components/themed-text';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme, useThemeStore } from '@/src/theme';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    Switch,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const theme = useTheme();
  const { mode, setMode } = useThemeStore();
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const onSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ padding: theme.spacing[4] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: theme.spacing[6] }}>
          <ThemedText variant="heading" style={{ marginBottom: theme.spacing[2] }}>
            Settings
          </ThemedText>
          <ThemedText variant="caption" color="muted">
            Configure your app preferences
          </ThemedText>
        </View>

        {/* Theme Settings */}
        <Card style={{ marginBottom: theme.spacing[6] }}>
          <ThemedText variant="subheading" style={{ marginBottom: theme.spacing[4] }}>
            Appearance
          </ThemedText>
          
          {['light', 'dark', 'system'].map((themeMode) => (
            <View
              key={themeMode}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: theme.spacing[3],
                borderBottomWidth: themeMode !== 'system' ? 1 : 0,
                borderBottomColor: theme.colors.border,
              }}
            >
              <View>
                <ThemedText variant="body" weight="medium">
                  {themeMode === 'light' ? 'Light Mode' : 
                   themeMode === 'dark' ? 'Dark Mode' : 'System Default'}
                </ThemedText>
                <ThemedText variant="caption" color="muted">
                  {themeMode === 'light' ? 'Always use light theme' : 
                   themeMode === 'dark' ? 'Always use dark theme' : 
                   'Follow system theme'}
                </ThemedText>
              </View>
              <Switch
                value={mode === themeMode}
                onValueChange={() => setMode(themeMode as any)}
                trackColor={{ 
                  false: theme.colors.secondary[300], 
                  true: theme.colors.primary[600] 
                }}
                thumbColor={theme.colors.surface}
              />
            </View>
          ))}
        </Card>

        {/* Account Actions */}
        <Card>
          <ThemedText variant="subheading" style={{ marginBottom: theme.spacing[4] }}>
            Account
          </ThemedText>
          
          <Button
            variant="danger"
            onPress={onSignOut}
            fullWidth
          >
            Sign Out
          </Button>
        </Card>

        {/* App Info */}
        <View style={{ 
          alignItems: 'center', 
          marginTop: theme.spacing[6],
          marginBottom: theme.spacing[4]
        }}>
          <ThemedText variant="caption" color="muted">
            FadeUp v1.0.0
          </ThemedText>
          <ThemedText variant="caption" color="muted">
            Built with ❤️ for barbershops
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}