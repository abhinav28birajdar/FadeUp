// src/types/index.ts

export type UserRole = 'customer' | 'shopkeeper';

export interface User {
  id: string; // Supabase auth user ID
  email: string;
  role: UserRole;
  shop_id?: string; // Nullable, only for shopkeepers
  created_at?: string;
  name?: string; // Added for display purposes
}

export interface Shop {
  id: string;
  name: string;
  address: string;
  description: string;
  image_url?: string;
  owner_id?: string; // Added owner_id for RLS/logic
  average_rating?: number; // Calculated field
  // Add other shop-specific fields as needed for features
}

export interface Service {
  id: string;
  shop_id: string; // Foreign key to Shop
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  // Add other service-specific fields
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  customer_id: string; // Foreign key to User
  shop_id: string;     // Foreign key to Shop
  services_ids: string[];  // Array of service IDs booked from database
  booking_date: string; // ISO string, e.g., 'YYYY-MM-DD'
  booking_time: string; // e.g., 'HH:MM'
  total_price: number;
  feedback_comment?: string; // Optional
  status: BookingStatus;
  created_at: string;
  // Joined/Denormalized data for display
  customers?: { email: string; name?: string } | null;
  shops?: { name: string } | null;
  services?: { name: string; price: number; duration_minutes: number }[] | null;
}

export type QueueStatus = 'waiting' | 'completed' | 'no_show';

export interface QueueEntry {
  id: string; // Primary key for queue entry
  booking_id: string; // Foreign key to Booking
  customer_id: string;
  shop_id: string;
  position: number; // Current position in queue (calculated/managed by backend logic or client-side)
  status: QueueStatus; // 'waiting', 'completed'
  entered_at: string;
  // Denormalized/joined data for display
  customers?: { email: string; name?: string } | null; // Customer name or email
  services_names?: string[]; // Array of service names
  booking_time?: string; // for queue display
}

export interface Feedback {
  id: string;
  customer_id: string; // Foreign key to User
  shop_id: string;     // Foreign key to Shop
  rating: number;      // 1-5 stars
  comment: string;
  created_at: string;
  // Derived fields for display
  customers?: { email: string; name?: string } | null;
  shops?: { name: string } | null;
}