export type UserRole = 'barber' | 'customer';

export type QueueStatus = 'waiting' | 'active' | 'done' | 'cancelled';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type NotificationType = 'queue_update' | 'booking_confirmed' | 'your_turn' | 'service_started';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Shop {
  id: string;
  barberId: string; // user_id
  name: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  imageUrls: string[];
  openingHours: OpeningHours;
  rating: number;
  totalRatings: number;
  isOpen: boolean;
  maxSimultaneousSlots: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OpeningHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime: string; // "09:00"
  closeTime: string; // "18:00"
}

export interface Service {
  id: string;
  shopId: string;
  title: string;
  description?: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QueueItem {
  id: string;
  shopId: string;
  userId: string;
  serviceId: string;
  status: QueueStatus;
  positionIndex: number;
  estimatedWaitMinutes: number;
  customerName: string;
  customerPhone?: string;
  serviceName: string;
  serviceDuration: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
}

export interface Booking {
  id: string;
  shopId: string;
  userId: string;
  serviceId: string;
  scheduledTime: Date;
  status: BookingStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  payload?: any;
  isRead: boolean;
  createdAt: Date;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface ShopWithDistance extends Shop {
  distance: number; // in kilometers
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

// Form types
export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface ShopFormData {
  name: string;
  description?: string;
  address: string;
  phone?: string;
  openingHours: OpeningHours;
  maxSimultaneousSlots: number;
}

export interface ServiceFormData {
  title: string;
  description?: string;
  price: number;
  durationMinutes: number;
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

// Hook return types
export interface UseLocationResult {
  location: Location | null;
  loading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<Location | null>;
}

export interface UseShopsResult {
  shops: ShopWithDistance[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseQueueResult {
  queueItems: QueueItem[];
  activeCustomer: QueueItem | null;
  waitingCount: number;
  loading: boolean;
  error: string | null;
}

// Firestore document converters
export interface FirestoreUser extends Omit<User, 'createdAt' | 'updatedAt'> {
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface FirestoreShop extends Omit<Shop, 'createdAt' | 'updatedAt'> {
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface FirestoreQueueItem extends Omit<QueueItem, 'createdAt' | 'startedAt' | 'completedAt' | 'cancelledAt'> {
  createdAt: any; // Firestore Timestamp
  startedAt?: any; // Firestore Timestamp
  completedAt?: any; // Firestore Timestamp
  cancelledAt?: any; // Firestore Timestamp
}