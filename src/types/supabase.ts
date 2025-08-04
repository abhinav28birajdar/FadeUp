export interface UserProfile {
  id: string;
  created_at: string;
  email: string;
  role: 'customer' | 'shopkeeper';
  first_name: string;
  last_name: string;
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
  image_url?: string;
  average_rating?: number;
}

export interface Service {
  id: string;
  created_at: string;
  shop_id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  description?: string;
}

export interface Booking {
  id: string;
  created_at: string;
  customer_id: string;
  shop_id: string;
  service_ids: string[];
  booking_date: string; // YYYY-MM-DD
  slot_time: string; // HH:MM
  total_price: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
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
