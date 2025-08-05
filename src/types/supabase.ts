export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'customer' | 'shopkeeper';
          phone?: string;
          avatar_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: 'customer' | 'shopkeeper';
          phone?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: 'customer' | 'shopkeeper';
          phone?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      shops: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description?: string;
          address: string;
          latitude?: number;
          longitude?: number;
          phone?: string;
          email?: string;
          opening_hours?: any;
          images?: string[];
          rating: number;
          total_ratings: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description?: string;
          address: string;
          latitude?: number;
          longitude?: number;
          phone?: string;
          email?: string;
          opening_hours?: any;
          images?: string[];
          rating?: number;
          total_ratings?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          description?: string;
          address?: string;
          latitude?: number;
          longitude?: number;
          phone?: string;
          email?: string;
          opening_hours?: any;
          images?: string[];
          rating?: number;
          total_ratings?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          shop_id: string;
          name: string;
          description?: string;
          duration: number;
          price: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          name: string;
          description?: string;
          duration: number;
          price: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          name?: string;
          description?: string;
          duration?: number;
          price?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          customer_id: string;
          shop_id: string;
          service_id: string;
          booking_date: string;
          booking_time: string;
          status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
          total_price: number;
          notes?: string;
          estimated_duration?: number;
          actual_start_time?: string;
          actual_end_time?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          shop_id: string;
          service_id: string;
          booking_date: string;
          booking_time: string;
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
          total_price: number;
          notes?: string;
          estimated_duration?: number;
          actual_start_time?: string;
          actual_end_time?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          shop_id?: string;
          service_id?: string;
          booking_date?: string;
          booking_time?: string;
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
          total_price?: number;
          notes?: string;
          estimated_duration?: number;
          actual_start_time?: string;
          actual_end_time?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      queue: {
        Row: {
          id: string;
          shop_id: string;
          customer_id: string;
          booking_id: string;
          position: number;
          status: 'waiting' | 'in_service' | 'completed' | 'cancelled';
          estimated_wait_time?: number;
          joined_at: string;
          started_at?: string;
          completed_at?: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          customer_id: string;
          booking_id: string;
          position: number;
          status?: 'waiting' | 'in_service' | 'completed' | 'cancelled';
          estimated_wait_time?: number;
          joined_at?: string;
          started_at?: string;
          completed_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          customer_id?: string;
          booking_id?: string;
          position?: number;
          status?: 'waiting' | 'in_service' | 'completed' | 'cancelled';
          estimated_wait_time?: number;
          joined_at?: string;
          started_at?: string;
          completed_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          customer_id: string;
          shop_id: string;
          rating: number;
          comment?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          customer_id: string;
          shop_id: string;
          rating: number;
          comment?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          customer_id?: string;
          shop_id?: string;
          rating?: number;
          comment?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          is_read: boolean;
          data?: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          is_read?: boolean;
          data?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: string;
          is_read?: boolean;
          data?: any;
          created_at?: string;
        };
      };
      shop_availability: {
        Row: {
          id: string;
          shop_id: string;
          date: string;
          start_time: string;
          end_time: string;
          is_available: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          date: string;
          start_time: string;
          end_time: string;
          is_available?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          is_available?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_nearby_shops: {
        Args: {
          user_lat: number;
          user_lng: number;
          radius_km?: number;
        };
        Returns: {
          id: string;
          name: string;
          description?: string;
          address: string;
          latitude?: number;
          longitude?: number;
          phone?: string;
          rating: number;
          total_ratings: number;
          distance_km: number;
        }[];
      };
      calculate_estimated_wait_time: {
        Args: {
          shop_id_param: string;
          position_param: number;
        };
        Returns: number;
      };
      send_notification: {
        Args: {
          user_id_param: string;
          title_param: string;
          message_param: string;
          type_param: string;
          data_param?: any;
        };
        Returns: string;
      };
    };
    Enums: {
      user_role: 'customer' | 'shopkeeper';
      booking_status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
      queue_status: 'waiting' | 'in_service' | 'completed' | 'cancelled';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Type helpers
export type User = Database['public']['Tables']['users']['Row'];
export type Shop = Database['public']['Tables']['shops']['Row'];
export type Service = Database['public']['Tables']['services']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type QueueItem = Database['public']['Tables']['queue']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type ShopAvailability = Database['public']['Tables']['shop_availability']['Row'];

export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type ShopInsert = Database['public']['Tables']['shops']['Insert'];
export type ServiceInsert = Database['public']['Tables']['services']['Insert'];
export type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
export type QueueItemInsert = Database['public']['Tables']['queue']['Insert'];
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
export type ShopAvailabilityInsert = Database['public']['Tables']['shop_availability']['Insert'];

export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type ShopUpdate = Database['public']['Tables']['shops']['Update'];
export type ServiceUpdate = Database['public']['Tables']['services']['Update'];
export type BookingUpdate = Database['public']['Tables']['bookings']['Update'];
export type QueueItemUpdate = Database['public']['Tables']['queue']['Update'];
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update'];
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];
export type ShopAvailabilityUpdate = Database['public']['Tables']['shop_availability']['Update'];

// Legacy type aliases for backward compatibility
export interface UserProfile extends User {}

export interface QueueEntry {
  id: string;
  created_at: string;
  booking_id: string;
  customer_id: string;
  shop_id: string;
  position: number;
  status: 'waiting' | 'in_progress' | 'ready_next' | 'completed' | 'skipped';
  estimated_completion_time?: string;
}

export interface Feedback {
  id: string;
  created_at: string;
  booking_id: string;
  customer_id: string;
  shop_id: string;
  rating: number; // 1-5 stars
  comment?: string;
  submitted_at: string;
}
