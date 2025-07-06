import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '@/src/lib/firebase';
import ModernCard from '@/src/components/ModernCard';
import { useAuthStore } from '@/src/store/authStore';
import { UserProfile } from '@/src/types/firebaseModels';

export default function LoginScreen() {
  const { role } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginPressed, setLoginPressed] = useState(false);
  const [registerPressed, setRegisterPressed] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as Omit<UserProfile, 'id'>;
        
        // Verify user role matches selected role
        if (userData.role !== role) {
          Alert.alert(
            'Wrong Account Type', 
            `This account is registered as a ${userData.role}. Please go back and select the correct role.`
          );
          await auth.signOut();
          setLoading(false);
          return;
        }
        
        // Redirect based on role
        if (role === 'customer') {
          router.replace('/(customer)/home');
        } else if (role === 'shopkeeper') {
          router.replace('/(shopkeeper)/dashboard');
        }
      } else {
        Alert.alert('Error', 'User profile not found');
        await auth.signOut();
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.message || 'Please check your credentials and try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 600 }}
      >
        <Text style={[styles.title, { color: '#38BDF8', fontSize: 24, fontWeight: 'bold' }]}>
          Login
        </Text>
      </MotiView>

      <ModernCard style={{ width: '85%', maxWidth: 400 }} delay={200}>
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 600, delay: 300 }}
        >
          <Text style={{ color: '#38BDF8', fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
            Email
          </Text>
          <MotiView
            animate={{ 
              borderColor: emailFocused ? '#38BDF8' : '#52525B',
              translateY: emailFocused ? -2 : 0
            }}
            transition={{ type: 'timing', duration: 200 }}
            style={styles.inputContainer}
          >
            <TextInput
              style={{ backgroundColor: 'rgba(24,24,27,0.5)', padding: 16, borderRadius: 12, color: '#38BDF8' }}
              placeholder="Enter your email"
              placeholderTextColor="#A1A1AA"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </MotiView>

          <Text style={{ color: '#38BDF8', fontSize: 18, fontWeight: '600', marginBottom: 8, marginTop: 16 }}>
            Password
          </Text>
          <MotiView
            animate={{ 
              borderColor: passwordFocused ? '#38BDF8' : '#52525B',
              translateY: passwordFocused ? -2 : 0
            }}
            transition={{ type: 'timing', duration: 200 }}
            style={styles.inputContainer}
          >
            <TextInput
              style={{ backgroundColor: 'rgba(24,24,27,0.5)', padding: 16, borderRadius: 12, color: '#38BDF8' }}
              placeholder="Enter your password"
              placeholderTextColor="#A1A1AA"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              secureTextEntry
            />
          </MotiView>

          <Pressable
            onPressIn={() => setLoginPressed(true)}
            onPressOut={() => setLoginPressed(false)}
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => [
              pressed && styles.buttonPressed,
              { marginTop: 24 }
            ]}
          >
            <ModernCard 
              style={{ backgroundColor: '#0EA5E9', paddingVertical: 16 }}
              pressed={loginPressed}
            >
              {loading ? (
                <ActivityIndicator color="#F3F4F6" />
              ) : (
                <Text style={{ color: '#F3F4F6', textAlign: 'center', fontSize: 18, fontWeight: '600' }}>
                  Login
                </Text>
              )}
            </ModernCard>
          </Pressable>

          <Pressable
            onPressIn={() => setRegisterPressed(true)}
            onPressOut={() => setRegisterPressed(false)}
            onPress={() => router.push('/(auth)/register')}
            style={({ pressed }) => [
              pressed && styles.buttonPressed,
              { marginTop: 16 }
            ]}
          >
            <Text style={{ color: '#38BDF8', textAlign: 'center', paddingVertical: 8 }}>
              {"Don't have an account? Register"}
            </Text>
          </Pressable>
        </MotiView>
      </ModernCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: 30,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonPressed: {
    opacity: 0.9,
  },
});