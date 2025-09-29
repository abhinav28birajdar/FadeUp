import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store/authStore';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const { userType } = useLocalSearchParams<{ userType?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showSocialLogin, setShowSocialLogin] = useState(false);
  
  const { setSession, setUser, setRole } = useAuthStore();

  const currentUserType = (userType as 'customer' | 'barber') || 'customer';
  
  const themeColors = {
    customer: {
      gradient: ['#667eea', '#764ba2'],
      primary: '#4facfe',
      accent: '#00f2fe',
    },
    barber: {
      gradient: ['#fa709a', '#fee140'],
      primary: '#fa709a',
      accent: '#fee140',
    },
  };

  const colors = themeColors[currentUserType];

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        Alert.alert('Login Error', error.message);
        return;
      }

      if (data.session) {
        // Fetch user profile from the new users table
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        if (profileError || !userProfile) {
          Alert.alert('Error', 'User profile not found');
          await supabase.auth.signOut();
          return;
        }

        // Role validation
        if (userProfile.user_type !== currentUserType) {
          Alert.alert(
            'Role Mismatch', 
            `You selected ${currentUserType} but your account is registered as ${userProfile.user_type}`
          );
          await supabase.auth.signOut();
          return;
        }

        // Update auth store
        setSession(data.session);
        setUser(userProfile);
        setRole(userProfile.user_type);

        // Navigate based on role
        if (userProfile.user_type === 'customer') {
          router.replace('/(customer)/home');
        } else if (userProfile.user_type === 'barber') {
          router.replace('/(shopkeeper)/dashboard');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `fadeup://auth/callback?userType=${currentUserType}`,
        },
      });

      if (error) {
        Alert.alert('Social Login Error', error.message);
      }
    } catch (error) {
      console.error('Social login error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient colors={colors.gradient} style={styles.gradient}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <Text style={styles.userTypeIndicator}>
                {currentUserType === 'customer' ? 'Customer' : 'Barber'} Login
              </Text>
            </View>
          </View>

          {/* Welcome Section */}
          <MotiView
            from={{ opacity: 0, translateY: -30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 800 }}
            style={styles.welcomeSection}
          >
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>
              {currentUserType === 'customer' 
                ? 'Find your perfect barber' 
                : 'Manage your barbershop'}
            </Text>
          </MotiView>

          {/* Login Form */}
          <MotiView
            from={{ opacity: 0, translateY: 50 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 800, delay: 200 }}
            style={styles.formContainer}
          >
            <BlurView intensity={20} style={styles.formBlur}>
              <View style={styles.form}>
                {/* Email Input */}
                <MotiView
                  animate={{
                    borderColor: emailFocused ? colors.primary : 'rgba(255, 255, 255, 0.3)',
                  }}
                  style={[styles.inputContainer, { borderColor: emailFocused ? colors.primary : 'rgba(255, 255, 255, 0.3)' }]}
                >
                  <Ionicons name="mail-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
                  <TextInput
                    placeholder="Email"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.textInput}
                  />
                </MotiView>

                {/* Password Input */}
                <MotiView
                  animate={{
                    borderColor: passwordFocused ? colors.primary : 'rgba(255, 255, 255, 0.3)',
                  }}
                  style={[styles.inputContainer, { borderColor: passwordFocused ? colors.primary : 'rgba(255, 255, 255, 0.3)' }]}
                >
                  <Ionicons name="lock-closed-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    secureTextEntry
                    style={styles.textInput}
                  />
                </MotiView>

                {/* Forgot Password */}
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={loading}
                  style={[styles.loginButton, { backgroundColor: colors.primary }]}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Text style={styles.loginButtonText}>Sign In</Text>
                      <Ionicons name="chevron-forward" size={20} color="white" />
                    </>
                  )}
                </TouchableOpacity>

                {/* Social Login Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Login Buttons */}
                <View style={styles.socialButtons}>
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleSocialLogin('google')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="logo-google" size={24} color="#DB4437" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleSocialLogin('facebook')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="logo-facebook" size={24} color="#4267B2" />
                  </TouchableOpacity>
                </View>

                {/* Register Link */}
                <TouchableOpacity
                  onPress={() => router.push(`/(auth)/register?userType=${currentUserType}`)}
                  style={styles.registerLink}
                >
                  <Text style={styles.registerText}>
                    Don't have an account? 
                    <Text style={[styles.registerHighlight, { color: colors.primary }]}> Sign Up</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </MotiView>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  headerContent: {
    flex: 1,
  },
  userTypeIndicator: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  formBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  form: {
    padding: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  textInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: 'white',
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 15,
    marginBottom: 30,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 15,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  registerLink: {
    alignItems: 'center',
  },
  registerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  registerHighlight: {
    fontWeight: '600',
  },
});

