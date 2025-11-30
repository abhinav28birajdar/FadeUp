import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { UI_CONFIG } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';

interface LoginScreenProps {
  onNavigateToSignup: () => void;
}

export function LoginScreen({ onNavigateToSignup }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your FadeUp account</Text>

        <View style={styles.form}>
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

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onNavigateToSignup} disabled={loading}>
          <Text style={styles.linkText}>
            Don't have an account? <Text style={styles.linkHighlight}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_CONFIG.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: UI_CONFIG.spacing.lg,
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
    marginBottom: UI_CONFIG.spacing.xxl,
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