import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { UI_CONFIG, VALIDATION_CONFIG } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface SignupScreenProps {
  onNavigateToLogin: () => void;
}

export function SignupScreen({ onNavigateToLogin }: SignupScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }

    if (!VALIDATION_CONFIG.emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (password.length < VALIDATION_CONFIG.minPasswordLength) {
      Alert.alert('Error', `Password must be at least ${VALIDATION_CONFIG.minPasswordLength} characters`);
      return false;
    }

    if (phone && !VALIDATION_CONFIG.phoneRegex.test(phone)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await signUp({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        phone: phone.trim() || undefined,
        role,
      });
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join FadeUp and start booking!</Text>

          <View style={styles.roleSelector}>
            <Text style={styles.roleLabel}>I am a:</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'customer' && styles.roleButtonSelected,
                ]}
                onPress={() => setRole('customer')}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'customer' && styles.roleButtonTextSelected,
                  ]}
                >
                  Customer
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'barber' && styles.roleButtonSelected,
                ]}
                onPress={() => setRole('barber')}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'barber' && styles.roleButtonTextSelected,
                  ]}
                >
                  Barber
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Phone Number (Optional)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onNavigateToLogin} disabled={loading}>
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkHighlight}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_CONFIG.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: UI_CONFIG.spacing.lg,
    paddingVertical: UI_CONFIG.spacing.xl,
  },
  title: {
    fontSize: UI_CONFIG.fontSize.xxxl,
    fontWeight: 'bold',
    color: UI_CONFIG.colors.text,
    textAlign: 'center',
    marginBottom: UI_CONFIG.spacing.sm,
  },
  subtitle: {
    fontSize: UI_CONFIG.fontSize.md,
    color: UI_CONFIG.colors.textSecondary,
    textAlign: 'center',
    marginBottom: UI_CONFIG.spacing.xl,
  },
  roleSelector: {
    marginBottom: UI_CONFIG.spacing.lg,
  },
  roleLabel: {
    fontSize: UI_CONFIG.fontSize.md,
    fontWeight: '600',
    color: UI_CONFIG.colors.text,
    marginBottom: UI_CONFIG.spacing.sm,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: UI_CONFIG.spacing.sm,
  },
  roleButton: {
    flex: 1,
    paddingVertical: UI_CONFIG.spacing.md,
    paddingHorizontal: UI_CONFIG.spacing.lg,
    borderRadius: UI_CONFIG.borderRadius.lg,
    borderWidth: 1,
    borderColor: UI_CONFIG.colors.border,
    backgroundColor: UI_CONFIG.colors.surface,
    alignItems: 'center',
  },
  roleButtonSelected: {
    borderColor: UI_CONFIG.colors.primary,
    backgroundColor: UI_CONFIG.colors.primary,
  },
  roleButtonText: {
    fontSize: UI_CONFIG.fontSize.md,
    fontWeight: '600',
    color: UI_CONFIG.colors.text,
  },
  roleButtonTextSelected: {
    color: 'white',
  },
  form: {
    marginBottom: UI_CONFIG.spacing.xl,
  },
  input: {
    borderWidth: 1,
    borderColor: UI_CONFIG.colors.border,
    borderRadius: UI_CONFIG.borderRadius.lg,
    paddingHorizontal: UI_CONFIG.spacing.md,
    paddingVertical: UI_CONFIG.spacing.md,
    fontSize: UI_CONFIG.fontSize.md,
    backgroundColor: UI_CONFIG.colors.surface,
    marginBottom: UI_CONFIG.spacing.md,
  },
  button: {
    borderRadius: UI_CONFIG.borderRadius.lg,
    paddingVertical: UI_CONFIG.spacing.md,
    alignItems: 'center',
    marginBottom: UI_CONFIG.spacing.md,
  },
  primaryButton: {
    backgroundColor: UI_CONFIG.colors.primary,
  },
  googleButton: {
    backgroundColor: UI_CONFIG.colors.surface,
    borderWidth: 1,
    borderColor: UI_CONFIG.colors.border,
  },
  buttonText: {
    color: 'white',
    fontSize: UI_CONFIG.fontSize.md,
    fontWeight: '600',
  },
  googleButtonText: {
    color: UI_CONFIG.colors.text,
    fontSize: UI_CONFIG.fontSize.md,
    fontWeight: '600',
  },
  dividerText: {
    textAlign: 'center',
    color: UI_CONFIG.colors.textSecondary,
    marginVertical: UI_CONFIG.spacing.md,
  },
  linkText: {
    textAlign: 'center',
    color: UI_CONFIG.colors.textSecondary,
    fontSize: UI_CONFIG.fontSize.md,
  },
  linkHighlight: {
    color: UI_CONFIG.colors.primary,
    fontWeight: '600',
  },
});