/**
 * Home Tab Screen
 * Displays customer HomeScreen or barber DashboardScreen based on user role
 */

import { DashboardScreen as BarberDashboardScreen } from '@/src/screens/barber';
import { CustomerHomeScreen } from '@/src/screens/customer';
import React from 'react';

// Mock user role - in production, get from auth context
const USER_ROLE: 'customer' | 'barber' = 'customer';

export default function HomeScreen() {
  if (USER_ROLE === 'barber') {
    return <BarberDashboardScreen />;
  }
  return <CustomerHomeScreen />;
}
