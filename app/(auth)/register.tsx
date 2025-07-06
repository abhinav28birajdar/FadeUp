import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

import { auth, db } from '@/src/lib/firebase';
import ModernCard from '@/src/components/ModernCard';
import { useAuthStore } from '@/src/store/authStore';

export default function RegisterScreen() {
  const { role } = useAuthStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [registerPressed, setRegisterPressed] = useState(false);
  const [loginPressed, setLoginPressed] = useState(false);

  const handleRegister = async () => {
    // Validate inputs
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        role,
        first_name: firstName,
        last_name: lastName,
        created_at: Timestamp.now(),
      });

      // If shopkeeper, we'll need to create a shop later
      if (role === 'customer') {
        router.replace('/(customer)/home');
      } else if (role === 'shopkeeper') {
        router.replace('/(shopkeeper)/dashboard');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', error.message || 'An error occurred during registration');
      await auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 600 }}
      >
        <Text style={[styles.title, { color: '#38BDF8', fontSize: 24, fontWeight: 'bold' }]}>
          Register
        </Text>
      </MotiView>

      <ModernCard style={{ width: '85%', maxWidth: 400 }} delay={200}>
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 600, delay: 300 }}
        >
          <Text style={{ color: '#38BDF8', fontSize: 18, fontWeight: '600', marginBottom: 8 }}>First Name</Text>
          <MotiView
            animate={{ 
              borderColor: firstNameFocused ? '#38BDF8' : '#52525B',
              translateY: firstNameFocused ? -2 : 0
            }}
            transition={{ type: 'timing', duration: 200 }}
            style={styles.inputContainer}
          >
            <TextInput
              style={{ backgroundColor: 'rgba(24,24,27,0.5)', padding: 16, borderRadius: 12, color: '#38BDF8' }}
              placeholder="Enter your first name"
              placeholderTextColor="#A1A1AA"
              value={firstName}
              onChangeText={setFirstName}
              onFocus={() => setFirstNameFocused(true)}
              onBlur={() => setFirstNameFocused(false)}
            />
          </MotiView>

          <Text style={{ color: '#38BDF8', fontSize: 18, fontWeight: '600', marginBottom: 8, marginTop: 16 }}>Last Name</Text>
          <MotiView
            animate={{ 
              borderColor: lastNameFocused ? '#38BDF8' : '#52525B',
              translateY: lastNameFocused ? -2 : 0
            }}
            transition={{ type: 'timing', duration: 200 }}
            style={styles.inputContainer}
          >
            <TextInput
              style={{ backgroundColor: 'rgba(24,24,27,0.5)', padding: 16, borderRadius: 12, color: '#38BDF8' }}
              placeholder="Enter your last name"
              placeholderTextColor="#A1A1AA"
              value={lastName}
              onChangeText={setLastName}
              onFocus={() => setLastNameFocused(true)}
              onBlur={() => setLastNameFocused(false)}
            />
          </MotiView>

          <Text style={{ color: '#38BDF8', fontSize: 18, fontWeight: '600', marginBottom: 8, marginTop: 16 }}>Email</Text>
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

          <Text style={{ color: '#38BDF8', fontSize: 18, fontWeight: '600', marginBottom: 8, marginTop: 16 }}>Password</Text>
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

          <Text style={{ color: '#38BDF8', fontSize: 18, fontWeight: '600', marginBottom: 8, marginTop: 16 }}>Confirm Password</Text>
          <MotiView
            animate={{ 
              borderColor: confirmPasswordFocused ? '#38BDF8' : '#52525B',
              translateY: confirmPasswordFocused ? -2 : 0
            }}
            transition={{ type: 'timing', duration: 200 }}
            style={styles.inputContainer}
          >
            <TextInput
              style={{ backgroundColor: 'rgba(24,24,27,0.5)', padding: 16, borderRadius: 12, color: '#38BDF8' }}
              placeholder="Confirm your password"
              placeholderTextColor="#A1A1AA"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onFocus={() => setConfirmPasswordFocused(true)}
              onBlur={() => setConfirmPasswordFocused(false)}
              secureTextEntry
            />
          </MotiView>

          <Pressable
            onPressIn={() => setRegisterPressed(true)}
            onPressOut={() => setRegisterPressed(false)}
            onPress={handleRegister}
            disabled={loading}
            style={({ pressed }) => [
              pressed && styles.buttonPressed,
              { marginTop: 24 }
            ]}
          >
            <ModernCard 
              style={{ backgroundColor: '#0EA5E9', paddingVertical: 16 }}
              pressed={registerPressed}
            >
              {loading ? (
                <ActivityIndicator color="#F3F4F6" />
              ) : (
                <Text style={{ color: '#F3F4F6', textAlign: 'center', fontSize: 18, fontWeight: '600' }}>Register</Text>
              )}
            </ModernCard>
          </Pressable>

          <Pressable
            onPressIn={() => setLoginPressed(true)}
            onPressOut={() => setLoginPressed(false)}
            onPress={() => router.push('/(auth)/login')}
            style={({ pressed }) => [
              pressed && styles.buttonPressed,
              { marginTop: 16, marginBottom: 8 }
            ]}
          >
            <Text style={{ color: '#38BDF8', textAlign: 'center', paddingVertical: 8 }}>Already have an account? Login</Text>
          </Pressable>
        </MotiView>
      </ModernCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
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