import React, { createContext, ReactNode, useContext, useState } from 'react';
import { bookingService } from '../services/firestoreEnhanced';
import { pushNotificationService } from '../services/pushNotifications';
import { Booking, BookingStatus } from '../types';
import { useAuth } from './AuthContext';

interface BookingContextType {
  bookings: Booking[];
  loading: boolean;
  createBooking: (shopId: string, serviceId: string, scheduledTime: Date, notes?: string) => Promise<string>;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => Promise<void>;
  getUserBookings: () => Promise<void>;
  getShopBookings: (shopId: string) => Promise<void>;
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
    serviceId: string,
    scheduledTime: Date,
    notes?: string
  ): Promise<string> => {
    if (!user) {
      throw new Error('User must be logged in to create booking');
    }

    setLoading(true);
    try {
      const bookingId = await bookingService.createBooking({
        shopId,
        userId: user.id,
        serviceId,
        scheduledTime,
        status: 'pending',
        notes,
      });

      // Send confirmation notification
      await pushNotificationService.sendLocalNotification(
        'Booking Created',
        `Your booking request has been submitted for ${scheduledTime.toLocaleDateString()}`,
        {
          type: 'booking_confirmed',
          bookingId,
          shopId,
        }
      );

      await getUserBookings(); // Refresh bookings
      return bookingId;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus): Promise<void> => {
    setLoading(true);
    try {
      await bookingService.updateBookingStatus(bookingId, status);
      
      if (status === 'confirmed') {
        await pushNotificationService.sendLocalNotification(
          'Booking Confirmed',
          'Your booking has been confirmed by the barber',
          {
            type: 'booking_confirmed',
            bookingId,
          }
        );
      }

      await getUserBookings(); // Refresh bookings
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUserBookings = async (): Promise<void> => {
    if (!user) return;

    setLoading(true);
    try {
      const userBookings = await bookingService.getBookingsByUser(user.id);
      setBookings(userBookings);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getShopBookings = async (shopId: string): Promise<void> => {
    setLoading(true);
    try {
      const shopBookings = await bookingService.getBookingsByShop(shopId);
      setBookings(shopBookings);
    } catch (error) {
      console.error('Error fetching shop bookings:', error);
      throw error;
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
        getUserBookings,
        getShopBookings,
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