/**
 * Settings Tab Screen
 * Displays settings screen (accessible from profile)
 */

import React from 'react';
import { SettingsScreen as BarberSettingsScreen } from '@/src/screens/barber';

// Mock user role - in production, get from auth context
const USER_ROLE: 'customer' | 'barber' = 'customer';

export default function Settings() {
  // For now, both use the same settings screen structure
  // In production, you might have CustomerSettingsScreen vs BarberSettingsScreen
  return <BarberSettingsScreen />;
}
