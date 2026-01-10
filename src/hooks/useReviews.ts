/**
 * Reviews Hooks
 * TanStack Query hooks for review-related data fetching
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateReviewData, reviewService } from '../services/supabase';

// Query keys
export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  shopReviews: (shopId: string, filters?: { rating?: number }) =>
    [...reviewKeys.all, 'shop', shopId, filters] as const,
  barberReviews: (barberId: string) =>
    [...reviewKeys.all, 'barber', barberId] as const,
  userReviews: (userId: string) =>
    [...reviewKeys.all, 'user', userId] as const,
  detail: (reviewId: string) =>
    [...reviewKeys.all, 'detail', reviewId] as const,
  canReview: (userId: string, bookingId: string) =>
    [...reviewKeys.all, 'canReview', userId, bookingId] as const,
};

/**
 * Hook to fetch shop reviews with pagination
 */
export function useShopReviews(
  shopId: string,
  options?: { rating?: number; limit?: number }
) {
  return useQuery({
    queryKey: reviewKeys.shopReviews(shopId, { rating: options?.rating }),
    queryFn: () => reviewService.getShopReviews(shopId, options?.limit || 20),
    enabled: !!shopId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch barber reviews
 */
export function useBarberReviews(barberId: string) {
  return useQuery({
    queryKey: reviewKeys.barberReviews(barberId),
    queryFn: () => reviewService.getBarberReviews(barberId),
    enabled: !!barberId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch user's reviews
 */
export function useUserReviews(userId: string) {
  return useQuery({
    queryKey: reviewKeys.userReviews(userId),
    queryFn: () => reviewService.getUserReviews(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to check if user can review a booking
 */
export function useCanReview(userId: string, bookingId: string) {
  return useQuery({
    queryKey: reviewKeys.canReview(userId, bookingId),
    queryFn: () => reviewService.canUserReview(userId, bookingId),
    enabled: !!userId && !!bookingId,
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to create a new review
 */
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewData) => reviewService.createReview(data),
    onSuccess: (_, variables) => {
      // Invalidate shop reviews
      queryClient.invalidateQueries({
        queryKey: reviewKeys.shopReviews(variables.shop_id),
      });
      // Invalidate user reviews
      queryClient.invalidateQueries({
        queryKey: reviewKeys.userReviews(variables.customer_id),
      });
      // Invalidate can review check
      queryClient.invalidateQueries({
        queryKey: reviewKeys.canReview(variables.customer_id, variables.booking_id),
      });
    },
  });
}

/**
 * Hook to update a review
 */
export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      rating,
      comment,
    }: {
      reviewId: string;
      rating: number;
      comment: string;
    }) => reviewService.updateReview(reviewId, rating, comment),
    onSuccess: () => {
      // Invalidate all review queries
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
  });
}

/**
 * Hook to delete a review
 */
export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => reviewService.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
  });
}

/**
 * Hook to reply to a review (for shop owners)
 */
export function useReplyToReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      reply,
    }: {
      reviewId: string;
      reply: string;
    }) => reviewService.respondToReview(reviewId, reply),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
  });
}

/**
 * Hook to report a review (placeholder - logs warning)
 */
export function useReportReview() {
  return useMutation({
    mutationFn: ({
      reviewId,
      reason,
    }: {
      reviewId: string;
      reason: string;
    }) => {
      console.warn('Report review not implemented:', reviewId, reason);
      return Promise.resolve();
    },
  });
}

/**
 * Hook to mark a review as helpful (placeholder - logs warning)
 */
export function useMarkReviewHelpful() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      userId,
    }: {
      reviewId: string;
      userId: string;
    }) => {
      console.warn('Mark review helpful not implemented:', reviewId, userId);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
  });
}

export default {
  useShopReviews,
  useBarberReviews,
  useUserReviews,
  useCanReview,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
  useReplyToReview,
  useReportReview,
  useMarkReviewHelpful,
};
