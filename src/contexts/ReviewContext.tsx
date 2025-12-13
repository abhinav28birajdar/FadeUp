import React, { createContext, ReactNode, useContext, useState } from 'react';
import { reviewService } from '../services/supabase/review.service';
import type { Review } from '../types';

export interface ReviewContextType {
  reviews: Review[];
  loading: boolean;
  submitReview: (
    bookingId: string,
    shopId: string,
    barberId: string | null,
    rating: number,
    comment: string
  ) => Promise<void>;
  getShopReviews: (shopId: string) => Promise<void>;
  getUserReviews: (userId: string) => Promise<void>;
  respondToReview: (reviewId: string, response: string) => Promise<void>;
}

interface ReviewProviderProps {
  children: ReactNode;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const ReviewProvider: React.FC<ReviewProviderProps> = ({ children }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  const submitReview = async (
    bookingId: string,
    shopId: string,
    barberId: string | null,
    rating: number,
    comment: string
  ): Promise<void> => {
    setLoading(true);
    try {
      // Get current user ID from auth context (you'd need to inject this)
      const customerId = 'current-user-id'; // TODO: Get from auth context
      
      await reviewService.submitReview(
        bookingId,
        shopId,
        customerId,
        barberId,
        rating,
        comment
      );
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getShopReviews = async (shopId: string): Promise<void> => {
    setLoading(true);
    try {
      const shopReviews = await reviewService.getShopReviews(shopId);
      setReviews(shopReviews);
    } catch (error) {
      console.error('Error fetching shop reviews:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUserReviews = async (userId: string): Promise<void> => {
    setLoading(true);
    try {
      const userReviews = await reviewService.getUserReviews(userId);
      setReviews(userReviews);
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const respondToReview = async (reviewId: string, response: string): Promise<void> => {
    setLoading(true);
    try {
      await reviewService.respondToReview(reviewId, response);
      // Refresh reviews
      const updatedReviews = reviews.map((review) =>
        review.id === reviewId
          ? { ...review, response, respondedAt: new Date() }
          : review
      );
      setReviews(updatedReviews);
    } catch (error) {
      console.error('Error responding to review:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        loading,
        submitReview,
        getShopReviews,
        getUserReviews,
        respondToReview,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviews = (): ReviewContextType => {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error('useReviews must be used within a ReviewProvider');
  }
  return context;
};