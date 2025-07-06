import { Timestamp } from 'firebase/firestore';

export type UserRole = 'customer' | 'shopkeeper' | 'unauthenticated';

export interface UserProfile {
  id: string; // Firebase Auth UID
  email: string;
  role: UserRole;
  shop_id?: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  expo_push_token?: string;
  created_at: Timestamp;
}

export interface Shop {
  id: string;
  name: string;
  address: string;
  description: string;
  owner_id: string; // Firebase Auth UID
  average_rating?: number;
  image_url?: string;
  created_at: Timestamp;
}

export interface Service {
  id: string;
  shop_id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  description?: string;
  created_at: Timestamp;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  customer_id: string;
  shop_id: string;
  service_ids: string[]; // Array of Service IDs
  booking_date: string; // YYYY-MM-DD format
  slot_time: string; // HH:MM format
  total_price: number;
  status: BookingStatus;
  feedback_comment?: string;
  created_at: Timestamp;
}

export type QueueStatus = 'waiting' | 'completed' | 'skipped';

export interface QueueEntry {
  id: string;
  booking_id: string;
  customer_id: string;
  shop_id: string;
  position: number;
  status: QueueStatus;
  estimated_completion_time?: Timestamp;
  created_at: Timestamp;
}

export interface Feedback {
  id: string;
  booking_id: string;
  customer_id: string;
  shop_id: string;
  rating: number; // 1-5
  comment?: string;
  submitted_at: Timestamp;
  created_at: Timestamp;
}