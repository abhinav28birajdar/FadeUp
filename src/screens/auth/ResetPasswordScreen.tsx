/**
 * Reset Password Screen
 * Set new password after email verification
 */

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Input } from '../../components/ui';
import { useTheme } from '../../theme';

interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (p) => p.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    test: (p) => /[A-Z]/.test(p),
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter',
    test: (p) => /[a-z]/.test(p),
  },
  {
    id: 'number',
    label: 'One number',
    test: (p) => /[0-9]/.test(p),
  },
  {
    id: 'special',
    label: 'One special character',
    test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
  },
];

export const ResetPasswordScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ token?: string }>();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const checkAnimation = React.useRef(new Animated.Value(0)).current;

  const validatePassword = () => {
    const newErrors: typeof errors = {};
    
    const passedRequirements = PASSWORD_REQUIREMENTS.filter((req) =>
      req.test(password)
    );
    
    if (passedRequirements.length < PASSWORD_REQUIREMENTS.length) {
      newErrors.password = 'Please meet all password requirements';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    Keyboard.dismiss();
    
    if (!validatePassword()) return;

    try {
      setLoading(true);
      
      // TODO: Implement actual password reset
      // await SupabaseAuthService.updatePassword(params.token, password);
      
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setSuccess(true);
      
      // Animate checkmark
      Animated.spring(checkAnimation, {
        toValue: 1,
        useNativeDriver: true,
        friction: 4,
      }).start();
      
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to reset password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToLogin = () => {
    router.replace('/auth/signin');
  };

  const handleBack = () => {
    if (success) {
      router.replace('/auth/signin');
    } else {
      router.back();
    }
  };

  const getPasswordStrength = () => {
    const passed = PASSWORD_REQUIREMENTS.filter((req) => req.test(password)).length;
    const percentage = (passed / PASSWORD_REQUIREMENTS.length) * 100;
    
    if (percentage === 100) return { label: 'Strong', color: theme.colors.success[500] };
    if (percentage >= 60) return { label: 'Good', color: theme.colors.warning[500] };
    if (percentage >= 40) return { label: 'Fair', color: theme.colors.warning[400] };
    return { label: 'Weak', color: theme.colors.error[500] };
  };

  const passwordStrength = getPasswordStrength();
  const strengthPercentage = (PASSWORD_REQUIREMENTS.filter((req) => req.test(password)).length / PASSWORD_REQUIREMENTS.length) * 100;

  if (success) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        <View style={styles.successContainer}>
          <Animated.View
            style={[
              styles.successIcon,
              {
                backgroundColor: theme.colors.success[50],
                transform: [{ scale: checkAnimation }],
              },
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={64}
              color={theme.colors.success[500]}
            />
          </Animated.View>
          
          <Text style={[styles.successTitle, { color: theme.colors.text.primary }]}>
            Password Reset Complete!
          </Text>
          
          <Text style={[styles.successDescription, { color: theme.colors.text.secondary }]}>
            Your password has been successfully reset. You can now sign in with your new password.
          </Text>
          
          <Button
            onPress={handleContinueToLogin}
            fullWidth
            size="lg"
            style={{ marginTop: 32 }}
          >
            Continue to Sign In
          </Button>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 24,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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
        <View style={styles.content}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.colors.primary[50] },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={48}
              color={theme.colors.primary[500]}
            />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            Create New Password
          </Text>
          <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
            Your new password must be different from previously used passwords.
          </Text>

          {/* Password Input */}
          <Input
            label="New Password"
            placeholder="Enter new password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            error={errors.password}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.colors.text.secondary}
                />
              </TouchableOpacity>
            }
          />

          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBar}>
                <View
                  style={[
                    styles.strengthProgress,
                    {
                      width: `${strengthPercentage}%`,
                      backgroundColor: passwordStrength.color,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                {passwordStrength.label}
              </Text>
            </View>
          )}

          {/* Password Requirements */}
          <View style={styles.requirementsList}>
            {PASSWORD_REQUIREMENTS.map((req) => {
              const passed = req.test(password);
              return (
                <View key={req.id} style={styles.requirementItem}>
                  <Ionicons
                    name={passed ? 'checkmark-circle' : 'ellipse-outline'}
                    size={16}
                    color={passed ? theme.colors.success[500] : theme.colors.text.muted}
                  />
                  <Text
                    style={[
                      styles.requirementText,
                      {
                        color: passed
                          ? theme.colors.success[500]
                          : theme.colors.text.secondary,
                      },
                    ]}
                  >
                    {req.label}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Confirm Password Input */}
          <Input
            label="Confirm Password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            error={errors.confirmPassword}
            rightIcon={
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.colors.text.secondary}
                />
              </TouchableOpacity>
            }
          />

          {/* Password Match Indicator */}
          {confirmPassword.length > 0 && (
            <View style={styles.matchIndicator}>
              <Ionicons
                name={password === confirmPassword ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={
                  password === confirmPassword
                    ? theme.colors.success[500]
                    : theme.colors.error[500]
                }
              />
              <Text
                style={[
                  styles.matchText,
                  {
                    color:
                      password === confirmPassword
                        ? theme.colors.success[500]
                        : theme.colors.error[500],
                  },
                ]}
              >
                {password === confirmPassword
                  ? 'Passwords match'
                  : 'Passwords do not match'}
              </Text>
            </View>
          )}

          {/* Reset Button */}
          <Button
            onPress={handleResetPassword}
            loading={loading}
            fullWidth
            size="lg"
            disabled={!password || !confirmPassword}
            style={{ marginTop: 24 }}
          >
            Reset Password
          </Button>

          {/* Security Note */}
          <View
            style={[
              styles.securityNote,
              { backgroundColor: theme.colors.neutral[100] },
            ]}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={theme.colors.primary[500]}
            />
            <Text
              style={[styles.securityText, { color: theme.colors.text.secondary }]}
            >
              For your security, you'll be signed out of all devices after resetting your password.
            </Text>
          </View>
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
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  strengthBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  strengthProgress: {
    height: '100%',
    borderRadius: 3,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 50,
  },
  requirementsList: {
    gap: 8,
    marginBottom: 24,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 13,
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  matchText: {
    fontSize: 13,
    fontWeight: '500',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 12,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  successContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  successDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ResetPasswordScreen;
