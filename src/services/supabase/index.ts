// Supabase Services - Central Export
export { SupabaseAuthService } from './auth.service';
export { SupabaseDatabaseService } from './database.service';
export { SupabaseStorageService } from './storage.service';
export { queueService, type QueuePosition, type QueueStats } from './queue.service';
export { shopService, type Shop, type Service, type NearbyShop } from './shop.service';
export { bookingService, type Booking, type CreateBookingData } from './booking.service';

// Re-export commonly used types
export type { AuthUser } from './auth.service';
