import React, { createContext, ReactNode, useContext, useState } from 'react';
import { bookingService, Booking } from '../services/supabase';
import { toastService } from '../services/toast.service';
import { useAuth } from './AuthContext';

interface BookingContextType {
  bookings: Booking[];
  loading: boolean;
  createBooking: (
    shopId: string,
    serviceIds: string[],
    scheduledTime: Date,
    totalAmount: number,
    notes?: string,
    barberId?: string
  ) => Promise<Booking>;
  updateBookingStatus: (
    bookingId: string,
    status: Booking['status'],
    reason?: string
  ) => Promise<void>;
  cancelBooking: (bookingId: string, reason?: string) => Promise<void>;
  completeBooking: (bookingId: string) => Promise<void>;
  getUserBookings: (status?: Booking['status']) => Promise<void>;
  getShopBookings: (shopId: string, status?: Booking['status']) => Promise<void>;
  getUpcomingBookings: () => Promise<void>;
  getPastBookings: () => Promise<void>;
}

interface BookingProviderProps {
  children: ReactNode;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const createBooking = async (
    shopId: string,
    serviceIds: string[],
    scheduledTime: Date,
    totalAmount: number,
    notes?: string,
    barberId?: string
  ): Promise<Booking> => {
    if (!user) {
      toastService.error('Please sign in to create a booking');
      throw new Error('User not authenticated');
    }

    setLoading(true);
    try {
      // Calculate estimated duration (this should come from services in production)
      const estimatedDuration = serviceIds.length * 30; // 30 mins per service estimate

      const booking = await bookingService.createBooking({
        shopId,
        customerId: user.id,
        serviceIds,
        bookingTime: scheduledTime,
        estimatedDuration,
        totalAmount,
        customerNotes: notes,
        barberId,
      });

      toastService.success('Booking created successfully!');
      await getUserBookings(); // Refresh bookings

      return booking;
    } catch (error) {
      console.error('Error creating booking:', error);
      toastService.error('Failed to create booking');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (
    bookingId: string,
    status: Booking['status'],
    reason?: string
  ): Promise<void> => {
    setLoading(true);
    try {
      await bookingService.updateBookingStatus(bookingId, status, reason);
      
      if (status === 'confirmed') {
        toastService.success('Booking confirmed!');
      } else if (status === 'completed') {
        toastService.success('Booking completed!');
      }

      await getUserBookings(); // Refresh bookings
    } catch (error) {
      console.error('Error updating booking status:', error);
      toastService.error('Failed to update booking');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string, reason?: string): Promise<void> => {
    setLoading(true);
    try {
      await bookingService.cancelBooking(bookingId, reason);
      toastService.success('Booking cancelled');
      await getUserBookings(); // Refresh bookings
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toastService.error('Failed to cancel booking');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const completeBooking = async (bookingId: string): Promise<void> => {
    setLoading(true);
    try {
      await bookingService.completeBooking(bookingId);
      toastService.success('Booking completed!');
      await getUserBookings(); // Refresh bookings
    } catch (error) {
      console.error('Error completing booking:', error);
      toastService.error('Failed to complete booking');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUserBookings = async (status?: Booking['status']): Promise<void> => {
    if (!user) return;

    setLoading(true);
    try {
      const userBookings = await bookingService.getCustomerBookings(user.id, status);
      setBookings(userBookings);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      toastService.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getShopBookings = async (shopId: string, status?: Booking['status']): Promise<void> => {
    setLoading(true);
    try {
      const shopBookings = await bookingService.getShopBookings(shopId, status);
      setBookings(shopBookings);
    } catch (error) {
      console.error('Error fetching shop bookings:', error);
      toastService.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingBookings = async (): Promise<void> => {
    if (!user) return;

    setLoading(true);
    try {
      const upcoming = await bookingService.getUpcomingBookings(user.id);
      setBookings(upcoming);
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
      toastService.error('Failed to load upcoming bookings');
    } finally {
      setLoading(false);
    }
  };

  const getPastBookings = async (): Promise<void> => {
    if (!user) return;

    setLoading(true);
    try {
      const past = await bookingService.getPastBookings(user.id);
      setBookings(past);
    } catch (error) {
      console.error('Error fetching past bookings:', error);
      toastService.error('Failed to load past bookings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        loading,
        createBooking,
        updateBookingStatus,
        cancelBooking,
        completeBooking,
        getUserBookings,
        getShopBookings,
        getUpcomingBookings,
        getPastBookings,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
