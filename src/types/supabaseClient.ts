import type { PostgrestQueryBuilder } from '@supabase/supabase-js';
import type {
    Booking,
    Feedback,
    QueueEntry,
    Service,
    ServiceCategory,
    Shop,
    UserProfile
} from './supabase';

// Type for Supabase enhanced client
export interface EnhancedSupabaseClient {
  from: <T = any>(table: string) => EnhancedPostgrestQueryBuilder<T>;
}

// Type for enhanced PostgrestQueryBuilder
export interface EnhancedPostgrestQueryBuilder<T> extends PostgrestQueryBuilder<T, any, any, any> {
  [key: string]: any;
}

// Common Supabase response type
export interface SupabaseResponse<T> {
  data: T | null;
  error: Error | null;
  status: number;
  statusText?: string;
}

// Database tables types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>;
      };
      shops: {
        Row: Shop;
        Insert: Omit<Shop, 'id' | 'created_at' | 'average_rating'>;
        Update: Partial<Omit<Shop, 'id' | 'created_at' | 'average_rating'>>;
      };
      services: {
        Row: Service;
        Insert: Omit<Service, 'id' | 'created_at'>;
        Update: Partial<Omit<Service, 'id' | 'created_at'>>;
      };
      service_categories: {
        Row: ServiceCategory;
        Insert: Omit<ServiceCategory, 'id' | 'created_at'>;
        Update: Partial<Omit<ServiceCategory, 'id' | 'created_at'>>;
      };
      bookings: {
        Row: Booking;
        Insert: Omit<Booking, 'id' | 'created_at'>;
        Update: Partial<Omit<Booking, 'id' | 'created_at'>>;
      };
      queue_entries: {
        Row: QueueEntry;
        Insert: Omit<QueueEntry, 'id' | 'created_at'>;
        Update: Partial<Omit<QueueEntry, 'id' | 'created_at'>>;
      };
      feedback: {
        Row: Feedback;
        Insert: Omit<Feedback, 'id' | 'created_at' | 'submitted_at'>;
        Update: Partial<Omit<Feedback, 'id' | 'created_at' | 'submitted_at'>>;
      };
    };
  };
}