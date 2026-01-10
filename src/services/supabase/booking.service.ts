import { getSupabase } from '../../config/supabase';
import { analyticsService } from '../analytics.service';

export interface Booking {
  id: string;
  customer_id: string;
  shop_id: string;
  barber_id?: string;
  service_ids: string[];
  booking_time: string;
  estimated_duration: number;
  estimated_end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  total_amount: number;
  is_paid: boolean;
  payment_method?: string;
  customer_notes?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBookingData {
  shopId: string;
  customerId: string;
  barberId?: string;
  serviceIds: string[];
  bookingTime: Date;
  estimatedDuration: number;
  totalAmount: number;
  customerNotes?: string;
}

class BookingService {
  /**
   * Create a new booking
   */
  async createBooking(bookingData: CreateBookingData): Promise<Booking> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const estimatedEndTime = new Date(bookingData.bookingTime);
      estimatedEndTime.setMinutes(
        estimatedEndTime.getMinutes() + bookingData.estimatedDuration
      );

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          customer_id: bookingData.customerId,
          shop_id: bookingData.shopId,
          barber_id: bookingData.barberId,
          service_ids: bookingData.serviceIds,
          booking_time: bookingData.bookingTime.toISOString(),
          estimated_duration: bookingData.estimatedDuration,
          estimated_end_time: estimatedEndTime.toISOString(),
          total_amount: bookingData.totalAmount,
          customer_notes: bookingData.customerNotes,
          status: 'pending',
          is_paid: false,
        })
        .select()
        .single();

      if (error) throw error;

      analyticsService.trackEvent('booking_created', {
        bookingId: data.id,
        shopId: bookingData.shopId,
        totalAmount: bookingData.totalAmount,
        serviceCount: bookingData.serviceIds.length,
      });

      return data as Booking;
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: string): Promise<Booking | null> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data as Booking | null;
    } catch (error) {
      console.error('Error getting booking:', error);
      return null;
    }
  }

  /**
   * Get customer bookings
   */
  async getCustomerBookings(customerId: string, status?: Booking['status']): Promise<Booking[]> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      let query = supabase
        .from('bookings')
        .select('*')
        .eq('customer_id', customerId)
        .order('booking_time', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data as Booking[]) || [];
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  }

  /**
   * Get shop bookings
   */
  async getShopBookings(shopId: string, status?: Booking['status']): Promise<Booking[]> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      let query = supabase
        .from('bookings')
        .select('*')
        .eq('shop_id', shopId)
        .order('booking_time', { ascending: true });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data as Booking[]) || [];
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(
    bookingId: string,
    status: Booking['status'],
    cancellationReason?: string
  ): Promise<Booking> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const updateData: any = { status };

      if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
        if (cancellationReason) {
          updateData.cancellation_reason = cancellationReason;
        }
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      analyticsService.trackEvent('booking_status_updated', { bookingId, status });

      return data as Booking;
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<Booking> {
    return this.updateBookingStatus(bookingId, 'cancelled', reason);
  }

  /**
   * Complete booking
   */
  async completeBooking(bookingId: string): Promise<Booking> {
    return this.updateBookingStatus(bookingId, 'completed');
  }

  /**
   * Mark booking as paid
   */
  async markAsPaid(bookingId: string, paymentMethod: string): Promise<Booking> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          is_paid: true,
          payment_method: paymentMethod,
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      analyticsService.trackEvent('booking_paid', { bookingId, paymentMethod });

      return data as Booking;
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  }

  /**
   * Get upcoming bookings for a customer
   */
  async getUpcomingBookings(customerId: string): Promise<Booking[]> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_id', customerId)
        .in('status', ['pending', 'confirmed'])
        .gte('booking_time', new Date().toISOString())
        .order('booking_time', { ascending: true });

      if (error) throw error;

      return (data as Booking[]) || [];
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  }

  /**
   * Get past bookings for a customer
   */
  async getPastBookings(customerId: string): Promise<Booking[]> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_id', customerId)
        .in('status', ['completed', 'cancelled', 'no_show'])
        .order('booking_time', { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data as Booking[]) || [];
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  }

  /**
   * Check if time slot is available
   */
  async isTimeSlotAvailable(
    shopId: string,
    barberId: string | undefined,
    startTime: Date,
    durationMinutes: number
  ): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + durationMinutes);

      let query = supabase
        .from('bookings')
        .select('id')
        .eq('shop_id', shopId)
        .in('status', ['pending', 'confirmed'])
        .gte('estimated_end_time', startTime.toISOString())
        .lte('booking_time', endTime.toISOString());

      if (barberId) {
        query = query.eq('barber_id', barberId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return !data || data.length === 0;
    } catch (error) {
      console.error('Error checking time slot availability:', error);
      return false;
    }
  }

  /**
   * Get available time slots for a barber on a specific date
   */
  async getAvailableSlots(
    shopId: string,
    barberId: string,
    date: string
  ): Promise<string[]> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      // Get shop operating hours
      const { data: shop } = await supabase
        .from('shops')
        .select('operating_hours')
        .eq('id', shopId)
        .single();

      if (!shop) return [];

      // Get existing bookings for the date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: bookings } = await supabase
        .from('bookings')
        .select('booking_time, estimated_end_time')
        .eq('shop_id', shopId)
        .eq('barber_id', barberId)
        .in('status', ['pending', 'confirmed'])
        .gte('booking_time', startOfDay.toISOString())
        .lte('booking_time', endOfDay.toISOString());

      // Generate available slots (simplified - 30 min intervals from 9am to 6pm)
      const slots: string[] = [];
      const bookedTimes = new Set(
        (bookings || []).map(b => new Date(b.booking_time).toISOString().slice(11, 16))
      );

      for (let hour = 9; hour < 18; hour++) {
        for (let min = 0; min < 60; min += 30) {
          const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
          if (!bookedTimes.has(timeStr)) {
            slots.push(timeStr);
          }
        }
      }

      return slots;
    } catch (error) {
      console.error('Error getting available slots:', error);
      return [];
    }
  }

  /**
   * Reschedule a booking
   */
  async rescheduleBooking(
    bookingId: string,
    newDate: string,
    newTime: string
  ): Promise<Booking> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const newDateTime = new Date(`${newDate}T${newTime}`);

      const { data, error } = await supabase
        .from('bookings')
        .update({
          booking_time: newDateTime.toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      analyticsService.trackEvent('booking_rescheduled', { bookingId });

      return data as Booking;
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  }
}

export const bookingService = new BookingService();
