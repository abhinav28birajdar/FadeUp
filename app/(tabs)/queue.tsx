/**
 * Queue Tab Screen
 * Displays customer QueueScreen or barber QueueManagementScreen
 */

import React from 'react';
import { QueueScreen as CustomerQueueScreen } from '@/src/screens/customer';
import { QueueManagementScreen as BarberQueueScreen } from '@/src/screens/barber';

// Mock user role - in production, get from auth context
const USER_ROLE: 'customer' | 'barber' = 'customer';

export default function Queue() {
  if (USER_ROLE === 'barber') {
    return <BarberQueueScreen />;
  }
  return <CustomerQueueScreen />;
}
