export interface UserProfile {
  id: string;
  email: string;
  role: 'customer' | 'shopkeeper';
  shop_id?: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  avatar_url?: string;
  expo_push_token?: string;
  notification_settings_json?: string;
  created_at: string;
}

export interface Shop {
  id: string;
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
  opening_hours_json?: string;
  created_at: string;
}

export interface Service {
  id: string;
  shop_id: string;
  category_id?: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  created_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  shop_id: string;
  service_ids: string[];
  booking_date: string;
  slot_time: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
}

export interface QueueEntry {
  id: string;
  booking_id: string;
  customer_id: string;
  shop_id: string;
  position: number;
  status: 'waiting' | 'in_progress' | 'ready_next' | 'completed' | 'skipped';
  estimated_completion_time?: string;
  in_progress_start_time?: string;
  created_at: string;
}

export interface Feedback {
  id: string;
  booking_id: string;
  customer_id: string;
  shop_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  submitted_at: string;
}

// Service Category interface
export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
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

export interface ServiceWithCategory extends Service {
  category?: ServiceCategory;
}

// Database insert/update types
export interface UserProfileInsert extends Omit<UserProfile, 'id' | 'created_at'> {}

export interface ShopInsert extends Omit<Shop, 'id' | 'created_at' | 'average_rating'> {}

export interface ServiceCategoryInsert extends Omit<ServiceCategory, 'id' | 'created_at'> {}

export interface ServiceInsert extends Omit<Service, 'id' | 'created_at'> {}

export interface BookingInsert extends Omit<Booking, 'id' | 'created_at'> {}

export interface QueueEntryInsert extends Omit<QueueEntry, 'id' | 'created_at'> {}

export interface FeedbackInsert extends Omit<Feedback, 'id' | 'created_at' | 'submitted_at'> {}
