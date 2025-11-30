import React, { useState } from 'react';
import { View } from 'react-native';
import { LoginScreen } from './LoginScreen';
import { SignupScreen } from './SignupScreen';
import { WelcomeScreen } from './WelcomeScreen';

type AuthFlow = 'welcome' | 'login' | 'signup';

export function AuthNavigator() {
  const [currentScreen, setCurrentScreen] = useState<AuthFlow>('welcome');

  const handleGetStarted = () => {
    setCurrentScreen('login');
  };

  const handleNavigateToSignup = () => {
    setCurrentScreen('signup');
  };

  const handleNavigateToLogin = () => {
    setCurrentScreen('login');
  };

  return (
    <View style={{ flex: 1 }}>
      {currentScreen === 'welcome' && (
        <WelcomeScreen onGetStarted={handleGetStarted} />
      )}
      {currentScreen === 'login' && (
        <LoginScreen onNavigateToSignup={handleNavigateToSignup} />
      )}
      {currentScreen === 'signup' && (
        <SignupScreen onNavigateToLogin={handleNavigateToLogin} />
      )}
    </View>
  );
}