import { supabase } from '../lib/supabase';

/**
 * Calculate total duration of services by their IDs
 */
export async function getServicesDuration(serviceIds: string[]): Promise<number> {
  try {
    const { data: services, error } = await supabase
      .from('services')
      .select('duration')
      .in('id', serviceIds);

    if (error) {
      console.error('Error fetching services duration:', error);
      return 0;
    }

    const totalDuration = services?.reduce((total, service) => total + service.duration, 0) || 0;
    return totalDuration;
  } catch (error) {
    console.error('Error calculating services duration:', error);
    return 0;
  }
}

/**
 * Calculate estimated wait time for a specific position in the queue
 * This is a synchronous client-side calculation based on currently fetched queue data
 * 
 * @param position The current position in queue
 * @param queueData Full queue data array for calculations
 * @returns Estimated wait time in minutes
 */
export function calculateQueuePositionTime(position: number, queueData: any[]): number {
  if (!queueData || queueData.length === 0) return 0;
  
  // Find all customers ahead in the waiting status
  const customersAhead = queueData.filter(
    item => item.status === 'waiting' && item.position < position
  );
  
  if (customersAhead.length === 0) return 0;
  
  // Calculate total wait time by summing service durations
  let totalWaitMinutes = 0;
  
  for (const customer of customersAhead) {
    if (customer.services && Array.isArray(customer.services)) {
      // Sum up the duration of all services for this customer
      const customerServiceTime = customer.services.reduce(
        (total: number, service: any) => total + (service.duration || 30), 
        0
      );
      totalWaitMinutes += customerServiceTime;
    } else {
      // Default estimate if service info is missing
      totalWaitMinutes += 25;
    }
  }
  
  // Add extra buffer time (5 mins per customer)
  totalWaitMinutes += customersAhead.length * 5;
  
  return totalWaitMinutes;
}

/**
 * Calculate estimated wait time for a customer in the queue
 */
export async function calculateEstimatedCustomerWaitTime(
  shopId: string,
  currentUserBookingId: string
): Promise<{position: number, peopleAhead: number, totalWaitMinutes: number | null}> {
  try {
    // Get all queue entries for the shop, ordered by position
    const { data: queueEntries, error } = await supabase
      .from('queue')
      .select('*')
      .eq('shop_id', shopId)
      .in('status', ['waiting', 'ready_next', 'in_progress'])
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching queue entries:', error);
      return { position: 0, peopleAhead: 0, totalWaitMinutes: null };
    }

    if (!queueEntries || queueEntries.length === 0) {
      return { position: 0, peopleAhead: 0, totalWaitMinutes: null };
    }

    // Find current user's position in queue
    const userQueueIndex = queueEntries.findIndex(entry => entry.booking_id === currentUserBookingId);
    
    if (userQueueIndex === -1) {
      return { position: 0, peopleAhead: 0, totalWaitMinutes: null };
    }

    const position = userQueueIndex + 1;
    const peopleAhead = userQueueIndex;

    // Calculate total wait time by summing durations of bookings ahead
    let totalWaitMinutes = 0;
    
    for (let i = 0; i < userQueueIndex; i++) {
      const queueEntry = queueEntries[i];
      
      // Get booking details to fetch service IDs
      const { data: booking } = await supabase
        .from('bookings')
        .select('service_ids')
        .eq('id', queueEntry.booking_id)
        .single();

      if (booking && booking.service_ids) {
        const duration = await getServicesDuration(booking.service_ids);
        totalWaitMinutes += duration;
      }
    }

    return { position, peopleAhead, totalWaitMinutes };
  } catch (error) {
    console.error('Error calculating estimated wait time:', error);
    return { position: 0, peopleAhead: 0, totalWaitMinutes: null };
  }
}

/**
 * Calculate estimated duration for a specific booking
 */
export async function calculateBookingEstimatedDuration(bookingId: string): Promise<number | null> {
  try {
    // Fetch booking details
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('service_ids')
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      console.error('Error fetching booking:', error);
      return null;
    }

    // Calculate total duration for services
    const totalDuration = await getServicesDuration(booking.service_ids);
    return totalDuration;
  } catch (error) {
    console.error('Error calculating booking duration:', error);
    return null;
  }
}
