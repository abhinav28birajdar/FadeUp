/**
 * Profile Tab Screen
 * Displays customer ProfileScreen or barber ShopProfileScreen
 */

import React from 'react';
import { ProfileScreen as CustomerProfileScreen } from '@/src/screens/customer';
import { ShopProfileScreen as BarberProfileScreen } from '@/src/screens/barber';

// Mock user role - in production, get from auth context
const USER_ROLE: 'customer' | 'barber' = 'customer';

export default function Profile() {
  if (USER_ROLE === 'barber') {
    return <BarberProfileScreen />;
  }
  return <CustomerProfileScreen />;
}
