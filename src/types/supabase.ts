export interface UserProfile {
  id: string;
  created_at: string;
  email: string;
  role: 'customer' | 'shopkeeper';
  first_name: string;
  last_name: string;
  phone_number?: string;
  shop_id?: string;
  avatar_url?: string;
  expo_push_token?: string;
}

export interface Shop {
  id: string;
  created_at: string;
  name: string;
  address: string;
  description?: string;
  owner_id: string;
  latitude: number;
  longitude: number;
  phone_number?: string;
  social_instagram?: string;
  social_facebook?: string;
  website_url?: string;
  image_url?: string;
  average_rating?: number;
  total_ratings?: number;
  opening_hours_json?: Record<string, string>;
}

export interface Service {
  id: string;
  created_at: string;
  shop_id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
}

export interface Booking {
  id: string;
  created_at: string;
  customer_id: string;
  shop_id: string;
  service_id?: string; // Legacy support
  service_ids: string[];
  booking_date: string;
  booking_time?: string; // Alias for slot_time in some parts of the app
  slot_time: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  customer_note?: string; // Additional customer notes
}

export interface QueueEntry {
  id: string;
  created_at: string;
  booking_id: string;
  customer_id: string;
  shop_id: string;
  position: number;
  status: 'waiting' | 'in_progress' | 'ready_next' | 'completed' | 'skipped';
  estimated_completion_time?: string;
  in_progress_start_time?: string;
}

export interface Feedback {
  id: string;
  created_at: string;
  booking_id: string;
  customer_id: string;
  shop_id: string;
  rating: number;
  comment?: string;
  submitted_at: string;
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
export interface UserProfileInsert extends Omit<UserProfile, 'id' | 'created_at'> {
  id: string;
}

export interface ShopInsert extends Omit<Shop, 'id' | 'created_at'> {}

export interface ServiceInsert extends Omit<Service, 'id' | 'created_at'> {}

export interface BookingInsert extends Omit<Booking, 'id' | 'created_at'> {}

export interface QueueEntryInsert extends Omit<QueueEntry, 'id' | 'created_at'> {}

export interface FeedbackInsert extends Omit<Feedback, 'id' | 'created_at'> {}
