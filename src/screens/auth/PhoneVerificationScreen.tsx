/**
 * Phone Verification Screen
 * OTP input for phone number verification
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

export const PhoneVerificationScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ phone?: string }>();
  
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const maxAttempts = 5;

  useEffect(() => {
    inputRefs.current[0]?.focus();
    startCountdown();
  }, []);

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
    if (locked) return;
    
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (digit && index === OTP_LENGTH - 1 && newOtp.every((d) => d)) {
      Keyboard.dismiss();
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    if (locked) return;
    
    if (event.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const handleVerify = async (code?: string) => {
    if (locked) {
      Alert.alert(
        'Account Locked',
        'Too many failed attempts. Please try again later.'
      );
      return;
    }
    
    const otpCode = code || otp.join('');
    
    if (otpCode.length !== OTP_LENGTH) {
      Alert.alert('Error', 'Please enter the complete verification code');
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement actual phone OTP verification
      // await SupabaseAuthService.verifyPhoneOtp(params.phone, otpCode);
      
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // For demo, accept any 6-digit code
      router.replace('/(tabs)');
    } catch (error: any) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= maxAttempts) {
        setLocked(true);
        Alert.alert(
          'Account Locked',
          'Too many failed attempts. Please contact support.'
        );
      } else {
        shakeInputs();
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
        Alert.alert(
          'Verification Failed',
          `Invalid code. ${maxAttempts - newAttempts} attempts remaining.`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0 || locked) return;

    try {
      setLoading(true);
      // TODO: Implement resend phone OTP
      // await SupabaseAuthService.sendPhoneOtp(params.phone);
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      startCountdown();
      Alert.alert('Success', 'Verification code sent via SMS');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleCallMe = async () => {
    if (countdown > 0 || locked) return;

    try {
      setLoading(true);
      // TODO: Implement voice call verification
      // await SupabaseAuthService.sendPhoneOtpViaCall(params.phone);
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      startCountdown();
      Alert.alert('Calling', 'You will receive an automated call shortly');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to initiate call');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeNumber = () => {
    router.back();
  };

  const handleBack = () => {
    router.back();
  };

  const maskedPhone = params.phone
    ? params.phone.replace(/(.{3})(.*)(.{4})/, '$1****$3')
    : 'your phone';

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
            { backgroundColor: theme.colors.success[50] },
          ]}
        >
          <Ionicons
            name="phone-portrait-outline"
            size={48}
            color={theme.colors.success[500]}
          />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Verify Your Phone
        </Text>
        <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
          Enter the 6-digit code sent to{'\n'}
          <Text style={{ fontWeight: '600' }}>{maskedPhone}</Text>
        </Text>

        {/* Attempts Warning */}
        {attempts > 0 && !locked && (
          <View
            style={[
              styles.warningBanner,
              { backgroundColor: theme.colors.warning[50] },
            ]}
          >
            <Ionicons
              name="warning-outline"
              size={18}
              color={theme.colors.warning[600]}
            />
            <Text
              style={[styles.warningText, { color: theme.colors.warning[700] }]}
            >
              {maxAttempts - attempts} attempts remaining
            </Text>
          </View>
        )}

        {/* Locked Warning */}
        {locked && (
          <View
            style={[
              styles.warningBanner,
              { backgroundColor: theme.colors.error[50] },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={theme.colors.error[600]}
            />
            <Text style={[styles.warningText, { color: theme.colors.error[700] }]}>
              Account temporarily locked
            </Text>
          </View>
        )}

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
                  backgroundColor: locked
                    ? theme.colors.neutral[100]
                    : theme.colors.input.background,
                  borderColor:
                    focusedIndex === index && !locked
                      ? theme.colors.success[500]
                      : digit
                      ? theme.colors.success[300]
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
              editable={!locked}
            />
          ))}
        </Animated.View>

        {/* Verify Button */}
        <Button
          onPress={() => handleVerify()}
          loading={loading}
          fullWidth
          size="lg"
          disabled={otp.some((d) => !d) || locked}
          style={{ marginTop: 24 }}
        >
          Verify Phone
        </Button>

        {/* Resend Options */}
        <View style={styles.resendContainer}>
          <Text style={[styles.resendText, { color: theme.colors.text.secondary }]}>
            Didn't receive the code?
          </Text>
          <View style={styles.resendOptions}>
            <TouchableOpacity
              onPress={handleResendCode}
              disabled={countdown > 0 || loading || locked}
            >
              <Text
                style={[
                  styles.resendLink,
                  {
                    color:
                      countdown > 0 || locked
                        ? theme.colors.text.muted
                        : theme.colors.primary[500],
                  },
                ]}
              >
                {countdown > 0 ? `Resend SMS (${countdown}s)` : 'Resend SMS'}
              </Text>
            </TouchableOpacity>
            
            <Text style={[styles.separator, { color: theme.colors.text.muted }]}>
              |
            </Text>
            
            <TouchableOpacity
              onPress={handleCallMe}
              disabled={countdown > 0 || loading || locked}
            >
              <Text
                style={[
                  styles.resendLink,
                  {
                    color:
                      countdown > 0 || locked
                        ? theme.colors.text.muted
                        : theme.colors.primary[500],
                  },
                ]}
              >
                Call Me
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Change Number */}
        <TouchableOpacity onPress={handleChangeNumber} style={styles.changeNumber}>
          <Ionicons
            name="swap-horizontal-outline"
            size={16}
            color={theme.colors.text.secondary}
          />
          <Text
            style={[styles.changeNumberText, { color: theme.colors.text.secondary }]}
          >
            Change phone number
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
    marginBottom: 24,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 24,
    gap: 8,
  },
  warningText: {
    fontSize: 14,
    fontWeight: '500',
  },
  otpContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  otpInput: {
    width: 46,
    height: 54,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  resendText: {
    fontSize: 14,
  },
  resendOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  separator: {
    fontSize: 14,
  },
  changeNumber: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },
  changeNumberText: {
    fontSize: 14,
  },
});

export default PhoneVerificationScreen;
