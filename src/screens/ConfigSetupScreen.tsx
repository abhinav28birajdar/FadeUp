import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Button } from '../components/ui/Button.enhanced';
import { Card } from '../components/ui/Card.enhanced';
import { Input } from '../components/ui/Input.enhanced';
import { configManager } from '../config/ConfigManager';
import { initializeSupabase, resetSupabase } from '../config/supabase';
import { AppConfigFormData, appConfigSchema } from '../schemas/validation';
import { useTheme } from '../theme';

export const ConfigSetupScreen: React.FC = () => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AppConfigFormData>({
    resolver: zodResolver(appConfigSchema),
    defaultValues: {
      supabaseUrl: '',
      supabaseAnonKey: '',
      firebaseApiKey: '',
      firebaseAuthDomain: '',
      firebaseProjectId: '',
    },
  });

  useEffect(() => {
    loadExistingConfig();
  }, []);

  const loadExistingConfig = async () => {
    try {
      const config = await configManager.loadConfig();
      if (config) {
        setValue('supabaseUrl', config.supabaseUrl);
        setValue('supabaseAnonKey', config.supabaseAnonKey);
        setValue('firebaseApiKey', config.firebaseApiKey || '');
        setValue('firebaseAuthDomain', config.firebaseAuthDomain || '');
        setValue('firebaseProjectId', config.firebaseProjectId || '');
        setIsConfigured(true);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const onSubmit = async (data: AppConfigFormData) => {
    setIsLoading(true);
    try {
      await configManager.saveConfig(data);
      
      // Reset and reinitialize Supabase with new config
      resetSupabase();
      const supabase = await initializeSupabase();
      
      if (supabase) {
        Alert.alert(
          'Success',
          'Configuration saved successfully! The app will now use Supabase.',
          [{ text: 'OK' }]
        );
        setIsConfigured(true);
      } else {
        Alert.alert('Warning', 'Configuration saved but Supabase initialization failed.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConfig = async () => {
    Alert.alert(
      'Clear Configuration',
      'Are you sure you want to clear all configuration? This will reset the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await configManager.clearConfig();
            resetSupabase();
            setValue('supabaseUrl', '');
            setValue('supabaseAnonKey', '');
            setValue('firebaseApiKey', '');
            setValue('firebaseAuthDomain', '');
            setValue('firebaseProjectId', '');
            setIsConfigured(false);
            Alert.alert('Success', 'Configuration cleared successfully');
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.colors.primary[100] },
            ]}
          >
            <Ionicons name="settings-outline" size={32} color={theme.colors.primary[500]} />
          </View>
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text.primary,
                fontFamily: theme.typography.fontFamily.bold,
              },
            ]}
          >
            App Configuration
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: theme.colors.text.secondary,
                fontFamily: theme.typography.fontFamily.regular,
              },
            ]}
          >
            {isConfigured
              ? 'Update your API configuration below'
              : 'Set up your Supabase and Firebase credentials to get started'}
          </Text>
        </View>

        <Card variant="elevated" padding="lg" style={styles.card}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.text.primary,
                fontFamily: theme.typography.fontFamily.semibold,
              },
            ]}
          >
            Supabase Configuration (Required)
          </Text>

          <Controller
            control={control}
            name="supabaseUrl"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Supabase URL"
                placeholder="https://your-project.supabase.co"
                value={value}
                onChangeText={onChange}
                error={errors.supabaseUrl?.message}
                leftIcon="cloud-outline"
                keyboardType="url"
                autoCapitalize="none"
              />
            )}
          />

          <Controller
            control={control}
            name="supabaseAnonKey"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Supabase Anon Key"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={value}
                onChangeText={onChange}
                error={errors.supabaseAnonKey?.message}
                leftIcon="key-outline"
                secureTextEntry
                autoCapitalize="none"
              />
            )}
          />

          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.text.primary,
                fontFamily: theme.typography.fontFamily.semibold,
                marginTop: theme.spacing[6],
              },
            ]}
          >
            Firebase Configuration (Optional)
          </Text>

          <Controller
            control={control}
            name="firebaseApiKey"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Firebase API Key"
                placeholder="AIzaSyD..."
                value={value}
                onChangeText={onChange}
                error={errors.firebaseApiKey?.message}
                leftIcon="flame-outline"
                autoCapitalize="none"
              />
            )}
          />

          <Controller
            control={control}
            name="firebaseAuthDomain"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Firebase Auth Domain"
                placeholder="your-project.firebaseapp.com"
                value={value}
                onChangeText={onChange}
                error={errors.firebaseAuthDomain?.message}
                leftIcon="globe-outline"
                autoCapitalize="none"
              />
            )}
          />

          <Controller
            control={control}
            name="firebaseProjectId"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Firebase Project ID"
                placeholder="your-project-id"
                value={value}
                onChangeText={onChange}
                error={errors.firebaseProjectId?.message}
                leftIcon="folder-outline"
                autoCapitalize="none"
              />
            )}
          />
        </Card>

        <View style={styles.actions}>
          <Button
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
          >
            {isConfigured ? 'Update Configuration' : 'Save Configuration'}
          </Button>

          {isConfigured && (
            <Button
              onPress={handleClearConfig}
              variant="outline"
              fullWidth
              style={styles.clearButton}
            >
              Clear Configuration
            </Button>
          )}
        </View>

        <View
          style={[
            styles.info,
            {
              backgroundColor: theme.isDark ? theme.colors.gray[800] : theme.colors.primary[50],
              borderColor: theme.colors.primary[200],
            },
          ]}
        >
          <Ionicons name="information-circle" size={20} color={theme.colors.primary[500]} />
          <Text
            style={[
              styles.infoText,
              {
                color: theme.colors.text.secondary,
                fontFamily: theme.typography.fontFamily.regular,
              },
            ]}
          >
            Your credentials are stored securely using Expo SecureStore and never leave your
            device.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  clearButton: {
    marginTop: 8,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
