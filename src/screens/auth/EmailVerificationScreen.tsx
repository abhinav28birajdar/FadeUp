/**
 * Email Verification Screen
 * OTP input for email verification
 */

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/ui';
import { useTheme } from '../../theme';

const OTP_LENGTH = 6;

export const EmailVerificationScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ email?: string }>();
  
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
    
    // Start countdown
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const shakeInputs = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleOtpChange = (text: string, index: number) => {
    // Only allow digits
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance to next input
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (digit && index === OTP_LENGTH - 1 && newOtp.every((d) => d)) {
      Keyboard.dismiss();
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const handleVerify = async (code?: string) => {
    const otpCode = code || otp.join('');
    
    if (otpCode.length !== OTP_LENGTH) {
      Alert.alert('Error', 'Please enter the complete verification code');
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement actual OTP verification
      // await SupabaseAuthService.verifyOtp(params.email, otpCode);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // For demo, accept any 6-digit code
      router.replace('/(tabs)');
    } catch (error: any) {
      shakeInputs();
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      Alert.alert('Verification Failed', error.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    try {
      setLoading(true);
      // TODO: Implement resend OTP
      // await SupabaseAuthService.resendOtp(params.email);
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setCountdown(60);
      Alert.alert('Success', 'Verification code resent successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmail = () => {
    router.back();
  };

  const handleBack = () => {
    router.back();
  };

  const maskedEmail = params.email
    ? params.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : 'your email';

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

      <View style={styles.content}>
        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.colors.primary[50] },
          ]}
        >
          <Ionicons
            name="mail-unread-outline"
            size={48}
            color={theme.colors.primary[500]}
          />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Verify Your Email
        </Text>
        <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
          We've sent a 6-digit code to{'\n'}
          <Text style={{ fontWeight: '600' }}>{maskedEmail}</Text>
        </Text>

        {/* OTP Input */}
        <Animated.View
          style={[
            styles.otpContainer,
            { transform: [{ translateX: shakeAnimation }] },
          ]}
        >
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                {
                  backgroundColor: theme.colors.input.background,
                  borderColor:
                    focusedIndex === index
                      ? theme.colors.primary[500]
                      : digit
                      ? theme.colors.primary[300]
                      : theme.colors.input.border,
                  color: theme.colors.text.primary,
                },
              ]}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => setFocusedIndex(index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </Animated.View>

        {/* Verify Button */}
        <Button
          onPress={() => handleVerify()}
          loading={loading}
          fullWidth
          size="lg"
          disabled={otp.some((d) => !d)}
          style={{ marginTop: 24 }}
        >
          Verify Email
        </Button>

        {/* Resend Code */}
        <View style={styles.resendContainer}>
          <Text style={[styles.resendText, { color: theme.colors.text.secondary }]}>
            Didn't receive the code?
          </Text>
          <TouchableOpacity
            onPress={handleResendCode}
            disabled={countdown > 0 || loading}
          >
            <Text
              style={[
                styles.resendLink,
                {
                  color:
                    countdown > 0
                      ? theme.colors.text.muted
                      : theme.colors.primary[500],
                },
              ]}
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Edit Email */}
        <TouchableOpacity onPress={handleEditEmail} style={styles.editEmail}>
          <Ionicons
            name="create-outline"
            size={16}
            color={theme.colors.text.secondary}
          />
          <Text
            style={[styles.editEmailText, { color: theme.colors.text.secondary }]}
          >
            Wrong email? Edit
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
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
  otpContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  resendText: {
    fontSize: 14,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  editEmail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },
  editEmailText: {
    fontSize: 14,
  },
});

export default EmailVerificationScreen;
