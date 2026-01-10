/**
 * Forgot Password Screen
 * Password reset request via email
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Input } from '../../components/ui';
import { useTheme } from '../../theme';

export const ForgotPasswordScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  const validateEmail = (): boolean => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    setError('');
    return true;
  };

  const handleSendResetLink = async () => {
    if (!validateEmail()) return;

    try {
      setLoading(true);
      // TODO: Implement actual password reset
      // await SupabaseAuthService.resetPassword(email);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setEmailSent(true);
      startCountdown();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendEmail = () => {
    if (countdown === 0) {
      handleSendResetLink();
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleBackToSignIn = () => {
    router.push('/auth/signin');
  };

  if (emailSent) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <View style={styles.successContent}>
          <View
            style={[
              styles.successIcon,
              { backgroundColor: theme.colors.success[50] },
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={48}
              color={theme.colors.success[500]}
            />
          </View>

          <Text style={[styles.successTitle, { color: theme.colors.text.primary }]}>
            Check Your Email
          </Text>
          <Text style={[styles.successDescription, { color: theme.colors.text.secondary }]}>
            We've sent a password reset link to{'\n'}
            <Text style={{ fontWeight: '600' }}>{email}</Text>
          </Text>

          <View style={styles.successActions}>
            <Button
              onPress={handleBackToSignIn}
              fullWidth
              size="lg"
            >
              Back to Sign In
            </Button>

            <TouchableOpacity
              onPress={handleResendEmail}
              disabled={countdown > 0}
              style={styles.resendButton}
            >
              <Text
                style={[
                  styles.resendText,
                  {
                    color:
                      countdown > 0
                        ? theme.colors.text.muted
                        : theme.colors.primary[500],
                  },
                ]}
              >
                {countdown > 0
                  ? `Resend email in ${countdown}s`
                  : "Didn't receive email? Resend"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.text.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.colors.primary[50] },
          ]}
        >
          <Ionicons
            name="lock-open-outline"
            size={48}
            color={theme.colors.primary[500]}
          />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Forgot Password?
        </Text>
        <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
          No worries! Enter your email address and we'll send you a link to reset your password.
        </Text>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError('');
            }}
            error={error}
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Button
            onPress={handleSendResetLink}
            loading={loading}
            fullWidth
            size="lg"
            style={{ marginTop: 8 }}
          >
            Send Reset Link
          </Button>
        </View>

        {/* Back to Sign In */}
        <TouchableOpacity
          onPress={handleBackToSignIn}
          style={styles.backToSignIn}
        >
          <Ionicons
            name="arrow-back"
            size={16}
            color={theme.colors.primary[500]}
          />
          <Text
            style={[styles.backToSignInText, { color: theme.colors.primary[500] }]}
          >
            Back to Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  form: {},
  backToSignIn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    gap: 8,
  },
  backToSignInText: {
    fontSize: 14,
    fontWeight: '500',
  },
  successContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  successDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  successActions: {
    width: '100%',
    gap: 16,
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ForgotPasswordScreen;
