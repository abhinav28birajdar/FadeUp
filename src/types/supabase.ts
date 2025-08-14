export interface UserProfile {
  id: string;
  email: string;
  role: 'customer' | 'shopkeeper';
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Shop {
  id: string;
  shopkeeper_id: string;
  name: string;
  description?: string;
  address: string;
  location: { lat: number; lng: number }; // Will be converted from PostGIS POINT
  phone?: string;
  image_url?: string;
  operating_hours?: Record<string, any>;
  status: 'open' | 'closed' | 'busy';
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  shop_id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  shop_id: string;
  service_id: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_time?: string;
  estimated_start_time?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  total_price: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface QueueEntry {
  id: string;
  booking_id: string;
  shop_id: string;
  customer_id: string;
  position: number;
  status: 'waiting' | 'ready_next' | 'in_progress' | 'completed' | 'cancelled';
  estimated_wait_time_minutes?: number;
  joined_at: string;
  started_at?: string;
  completed_at?: string;
  updated_at: string;
}

export interface Feedback {
  id: string;
  booking_id: string;
  customer_id: string;
  shop_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

// Extended types for UI
export interface ShopWithDistance extends Shop {
  distanceKm?: number;
}

export interface QueueEntryWithDetails extends QueueEntry {
  customer?: UserProfile;
  booking?: Booking;
  services?: Service[];
  estimatedDurationMinutes?: number;
}

export interface BookingWithDetails extends Booking {
  customer?: UserProfile;
  shop?: Shop;
  services?: Service[];
  queue_entry?: QueueEntry;
}

export interface FeedbackWithDetails extends Feedback {
  customer?: UserProfile;
  shop?: Shop;
}

// Database insert/update types
export interface UserProfileInsert extends Omit<UserProfile, 'created_at' | 'updated_at'> {}

export interface ShopInsert extends Omit<Shop, 'id' | 'created_at' | 'updated_at' | 'rating' | 'total_reviews'> {}

export interface ServiceInsert extends Omit<Service, 'id' | 'created_at' | 'updated_at'> {}

export interface BookingInsert extends Omit<Booking, 'id' | 'created_at' | 'updated_at'> {}

export interface QueueEntryInsert extends Omit<QueueEntry, 'id' | 'joined_at' | 'updated_at'> {}

export interface FeedbackInsert extends Omit<Feedback, 'id' | 'created_at'> {}
