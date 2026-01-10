// Supabase Services - Central Export
export { SupabaseAuthService } from './auth.service';
export { SupabaseDatabaseService } from './database.service';
export { SupabaseStorageService } from './storage.service';
export { queueService, type QueuePosition, type QueueStats } from './queue.service';
export { shopService, type Shop, type Service, type NearbyShop } from './shop.service';
export { bookingService, type Booking, type CreateBookingData } from './booking.service';
export { ReviewService } from './review.service';

// QueueEntry is alias for QueuePosition for backwards compatibility
export type { QueuePosition as QueueEntry } from './queue.service';

// Create review service instance
import { ReviewService as ReviewServiceClass } from './review.service';
export const reviewService = new ReviewServiceClass();

// Export CreateReviewData type for hooks
export interface CreateReviewData {
  shop_id: string;
  customer_id: string;
  booking_id: string;
  barber_id?: string;
  rating: number;
  comment?: string;
}

// Re-export commonly used types
export type { AuthUser } from './auth.service';
export type { Review } from '../../types';
