import React, { useState } from 'react';
import { LoadingScreen } from '../components/LoadingScreen';
import { useAuth } from '../contexts/AuthContext';
import { shopService } from '../services/firestore';
import { AuthNavigator } from './AuthNavigator';
import { BarberDashboard } from './BarberDashboard';
import { BarberOnboardingScreen } from './BarberOnboardingScreen';
import { CustomerDashboard } from './CustomerDashboard';
import { CustomerOnboardingScreen } from './CustomerOnboardingScreen';

export function AppNavigator() {
  const { user, loading } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [onboardingLoading, setOnboardingLoading] = useState(true);

  React.useEffect(() => {
    checkOnboardingStatus();
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) {
      setOnboardingLoading(false);
      return;
    }

    try {
      if (user.role === 'barber') {
        // Check if barber has a shop
        const shop = await shopService.getByBarberId(user.id);
        setNeedsOnboarding(!shop);
      } else {
        // Customer onboarding is optional, so we'll skip it for now
        setNeedsOnboarding(false);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setNeedsOnboarding(false);
    } finally {
      setOnboardingLoading(false);
    }
  };

  const handleOnboardingCompleted = () => {
    setNeedsOnboarding(false);
  };

  if (loading || onboardingLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthNavigator />;
  }

  if (needsOnboarding) {
    return user.role === 'barber' ? (
      <BarberOnboardingScreen onCompleted={handleOnboardingCompleted} />
    ) : (
      <CustomerOnboardingScreen onCompleted={handleOnboardingCompleted} />
    );
  }

  return user.role === 'barber' ? <BarberDashboard /> : <CustomerDashboard />;
}