/**
 * Bookings Tab Screen
 * Displays customer BookingsScreen or barber BookingsCalendarScreen
 */

import React from 'react';
import { BookingsScreen as CustomerBookingsScreen } from '@/src/screens/customer';
import { BookingsCalendarScreen as BarberBookingsScreen } from '@/src/screens/barber';

// Mock user role - in production, get from auth context
const USER_ROLE: 'customer' | 'barber' = 'customer';

export default function Bookings() {
  if (USER_ROLE === 'barber') {
    return <BarberBookingsScreen />;
  }
  return <CustomerBookingsScreen />;
}
