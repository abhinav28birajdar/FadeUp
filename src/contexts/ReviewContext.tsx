import {
    collection,
    doc,
    getDocs,
    limit,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
    where
} from 'firebase/firestore';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { db } from '../config/firebase';
import { enhancedShopService } from '../services/firestoreEnhanced';

export interface Review {
  id: string;
  userId: string;
  shopId: string;
  rating: number; // 1-5
  comment: string;
  customerName: string;
  createdAt: Date;
  isVerified?: boolean; // If the customer actually received service
}

interface ReviewContextType {
  reviews: Review[];
  loading: boolean;
  submitReview: (shopId: string, rating: number, comment: string) => Promise<void>;
  getShopReviews: (shopId: string) => Promise<void>;
  getUserReviews: (userId: string) => Promise<void>;
}

interface ReviewProviderProps {
  children: ReactNode;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const ReviewProvider: React.FC<ReviewProviderProps> = ({ children }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  const submitReview = async (shopId: string, rating: number, comment: string): Promise<void> => {
    setLoading(true);
    try {
      await runTransaction(db, async (transaction) => {
        // Add the review
        const reviewRef = doc(collection(db, 'reviews'));
        const reviewData = {
          userId: 'current-user-id', // This should come from auth context
          shopId,
          rating,
          comment,
          customerName: 'Customer Name', // This should come from auth context
          createdAt: serverTimestamp(),
          isVerified: false,
        };
        
        transaction.set(reviewRef, reviewData);
        
        // Update shop rating (this is handled in enhancedShopService.addRating)
        await enhancedShopService.addRating(shopId, rating);
      });
      
      console.log('Review submitted successfully');
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
      const q = query(
        collection(db, 'reviews'),
        where('shopId', '==', shopId),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      const querySnapshot = await getDocs(q);
      const shopReviews = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Review;
      });
      
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
      const q = query(
        collection(db, 'reviews'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const userReviews = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Review;
      });
      
      setReviews(userReviews);
    } catch (error) {
      console.error('Error fetching user reviews:', error);
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