/**
 * Booking Hooks
 * TanStack Query hooks for booking-related data fetching and mutations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Booking, bookingService, CreateBookingData } from '../services/supabase';

// Query keys for cache management
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (filters: { userId?: string; shopId?: string; status?: string }) =>
    [...bookingKeys.lists(), filters] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
  upcoming: (userId: string) => [...bookingKeys.all, 'upcoming', userId] as const,
  past: (userId: string) => [...bookingKeys.all, 'past', userId] as const,
  shopBookings: (shopId: string, date?: string) =>
    [...bookingKeys.all, 'shop', shopId, date] as const,
  availability: (shopId: string, barberId: string, date: string) =>
    [...bookingKeys.all, 'availability', shopId, barberId, date] as const,
};

/**
 * Hook to fetch user's upcoming bookings
 */
export function useUpcomingBookings(userId: string) {
  return useQuery({
    queryKey: bookingKeys.upcoming(userId),
    queryFn: () => bookingService.getUpcomingBookings(userId),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch user's past bookings
 */
export function usePastBookings(userId: string) {
  return useQuery({
    queryKey: bookingKeys.past(userId),
    queryFn: () => bookingService.getPastBookings(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single booking by ID
 */
export function useBooking(bookingId: string) {
  return useQuery({
    queryKey: bookingKeys.detail(bookingId),
    queryFn: () => bookingService.getBookingById(bookingId),
    enabled: !!bookingId,
  });
}

/**
 * Hook to fetch shop's bookings for a specific date (for barbers)
 */
export function useShopBookings(shopId: string, date?: string) {
  return useQuery({
    queryKey: bookingKeys.shopBookings(shopId, date),
    queryFn: () => bookingService.getShopBookings(shopId, date),
    enabled: !!shopId,
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to check availability for a specific barber on a date
 */
export function useBarberAvailability(
  shopId: string,
  barberId: string,
  date: string
) {
  return useQuery({
    queryKey: bookingKeys.availability(shopId, barberId, date),
    queryFn: () => bookingService.getAvailableSlots(shopId, barberId, date),
    enabled: !!shopId && !!date,
    staleTime: 30 * 1000, // 30 seconds - availability changes frequently
  });
}

/**
 * Hook to create a new booking
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingData) => bookingService.createBooking(data),
    onSuccess: (data, variables) => {
      // Invalidate all booking-related queries
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: bookingKeys.upcoming(variables.customerId),
      });
      queryClient.invalidateQueries({
        queryKey: bookingKeys.availability(
          variables.shopId,
          variables.barberId || '',
          variables.bookingTime.toISOString().split('T')[0]
        ),
      });
    },
  });
}

/**
 * Hook to cancel a booking
 */
export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      reason,
    }: {
      bookingId: string;
      reason?: string;
    }) => bookingService.cancelBooking(bookingId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}

/**
 * Hook to reschedule a booking
 */
export function useRescheduleBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      newDate,
      newTime,
    }: {
      bookingId: string;
      newDate: string;
      newTime: string;
    }) => bookingService.rescheduleBooking(bookingId, newDate, newTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}

/**
 * Hook to update booking status (for barbers)
 */
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      status,
    }: {
      bookingId: string;
      status: Booking['status'];
    }) => bookingService.updateBookingStatus(bookingId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}

/**
 * Hook to confirm a booking (for barbers)
 */
export function useConfirmBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) =>
      bookingService.updateBookingStatus(bookingId, 'confirmed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}

/**
 * Hook to complete a booking (for barbers)
 */
export function useCompleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) =>
      bookingService.updateBookingStatus(bookingId, 'completed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}

export default {
  useUpcomingBookings,
  usePastBookings,
  useBooking,
  useShopBookings,
  useBarberAvailability,
  useCreateBooking,
  useCancelBooking,
  useRescheduleBooking,
  useUpdateBookingStatus,
  useConfirmBooking,
  useCompleteBooking,
};
