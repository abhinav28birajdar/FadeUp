export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: 'customer' | 'barber' | 'admin';
  is_onboarded: boolean;
  shop_id?: string;
  wallet_balance: number;
  created_at: Date;
  updated_at: Date;
}

export interface Shop {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  address: string;
  city?: string;
  state?: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  is_open: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  average_rating: number;
  total_reviews: number;
  total_bookings: number;
  opening_time?: string;
  closing_time?: string;
  weekly_schedule?: Record<string, any>;
  capacity_slots: number;
  featured: boolean;
  verified: boolean;
  created_at: Date;
  updated_at: Date;
  distance?: number; // Calculated field for nearby shops
}

export interface Service {
  id: string;
  shop_id: string;
  category_id?: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  image_url?: string;
  popular: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
}

export interface Barber {
  id: string;
  profile_id?: string;
  shop_id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  is_available: boolean;
  experience_years: number;
  specialties: string[];
  rating: number;
  total_reviews: number;
  created_at: Date;
  updated_at: Date;
}

export interface Booking {
  id: string;
  customer_id: string;
  shop_id: string;
  barber_id?: string;
  service_ids: string[];
  booking_time: Date;
  estimated_duration: number;
  estimated_end_time: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  total_amount: number;
  is_paid: boolean;
  payment_method?: string;
  customer_notes?: string;
  cancellation_reason?: string;
  created_at: Date;
  updated_at: Date;
  
  // Relations
  customer?: User;
  shop?: Shop;
  barber?: Barber;
  services?: Service[];
}

export interface QueueItem {
  id: string;
  shop_id: string;
  customer_id: string;
  booking_id?: string;
  service_ids: string[];
  position: number;
  estimated_wait_minutes?: number;
  status: 'waiting' | 'serving' | 'completed' | 'cancelled';
  joined_at: Date;
  served_at?: Date;
  completed_at?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  
  // Relations
  customer?: User;
  shop?: Shop;
  services?: Service[];
}

export interface Review {
  id: string;
  booking_id: string;
  shop_id: string;
  customer_id: string;
  barber_id?: string;
  rating: number;
  comment?: string;
  response?: string;
  responded_at?: Date;
  is_visible: boolean;
  created_at: Date;
  updated_at: Date;
  
  // Relations
  customer?: User;
  shop?: Shop;
  barber?: Barber;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'queue_update' | 'booking_reminder' | 'promotion' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  read_at?: Date;
  created_at: Date;
}

export interface Payment {
  id: string;
  booking_id: string;
  customer_id: string;
  shop_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  transaction_id?: string;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Favorite {
  id: string;
  user_id: string;
  shop_id: string;
  created_at: Date;
  
  // Relations
  shop?: Shop;
}

// Form data types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  role: 'customer' | 'barber';
}

// Context types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignupFormData) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export interface QueueContextType {
  queueItems: QueueItem[];
  loading: boolean;
  joinQueue: (shopId: string, serviceId: string) => Promise<void>;
  leaveQueue: (queueItemId: string) => Promise<void>;
  completeCurrentCustomer: (queueItemId: string) => Promise<void>;
  getQueuePosition: (userId: string, shopId: string) => number;
  getEstimatedWait: (position: number, shopId: string) => number;
}
