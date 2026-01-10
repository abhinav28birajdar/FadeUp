/**
 * FadeUp Extended Types
 * Additional type definitions for the complete application
 */

import { Booking, Profile, QueueItem, Review, Shop } from './index';

// ============================================================================
// EXTENDED USER TYPES
// ============================================================================

export interface Customer extends Profile {
  favoriteShops: string[];
  favoriteBarbers: string[];
  loyaltyPoints: number;
  membershipTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  preferredServices: string[];
  preferredPaymentMethod?: string;
  communicationPreferences: CommunicationPreferences;
}

export interface Barber {
  id: string;
  profileId: string;
  shopId: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  isAvailable: boolean;
  experienceYears: number;
  specialties: string[];
  rating: number;
  totalReviews: number;
  servicesOffered: string[];
  workingHours: BarberWorkingHours;
  portfolio: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BarberWorkingHours {
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
  sunday: DayAvailability;
}

export interface DayAvailability {
  isWorking: boolean;
  startTime?: string;
  endTime?: string;
  breaks?: { start: string; end: string }[];
}

// ============================================================================
// SHOP EXTENDED TYPES
// ============================================================================

export interface ShopExtended extends Shop {
  slug: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  totalBookings: number;
  breakStartTime?: string;
  breakEndTime?: string;
  featured: boolean;
  verified: boolean;
  amenities: ShopAmenity[];
  socialLinks: SocialLinks;
  paymentMethods: PaymentMethod[];
  cancellationPolicy: CancellationPolicy;
  bookingPolicy: BookingPolicy;
}

export interface ShopAmenity {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  tiktok?: string;
  website?: string;
}

export interface PaymentMethod {
  type: 'cash' | 'card' | 'apple_pay' | 'google_pay' | 'paypal';
  enabled: boolean;
}

export interface CancellationPolicy {
  freeCancellationHours: number;
  lateCancellationFee: number;
  noShowFee: number;
}

export interface BookingPolicy {
  maxAdvanceBookingDays: number;
  minNoticeHours: number;
  requireDeposit: boolean;
  depositPercentage: number;
  allowRescheduling: boolean;
  rescheduleLimit: number;
  rescheduleNoticeHours: number;
  lateArrivalGraceMinutes: number;
}

// ============================================================================
// BOOKING EXTENDED TYPES
// ============================================================================

export interface BookingExtended extends Booking {
  shopName: string;
  shopAddress: string;
  shopPhone?: string;
  barberName?: string;
  barberAvatar?: string;
  services: BookingService[];
  totalDuration: number;
  subtotal: number;
  tax: number;
  tip?: number;
  discount?: number;
  totalAmount: number;
  depositPaid: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  paymentMethod?: string;
  customerNotes?: string;
  internalNotes?: string;
  referencePhotos: string[];
  cancellationReason?: string;
  cancelledBy?: 'customer' | 'shop';
  timeline: BookingTimelineEvent[];
}

export interface BookingService {
  serviceId: string;
  name: string;
  price: number;
  duration: number;
  quantity: number;
}

export interface BookingTimelineEvent {
  status: string;
  timestamp: Date;
  note?: string;
}

// ============================================================================
// QUEUE EXTENDED TYPES
// ============================================================================

export interface QueueItemExtended extends QueueItem {
  shopName: string;
  shopAddress: string;
  shopPhone?: string;
  services: QueueService[];
  totalDuration: number;
  assignedBarberId?: string;
  assignedBarberName?: string;
  customerAvatar?: string;
  isVip: boolean;
  notificationsSent: QueueNotification[];
}

export interface QueueService {
  serviceId: string;
  name: string;
  duration: number;
  price: number;
}

export interface QueueNotification {
  type: 'position_update' | 'almost_turn' | 'your_turn';
  sentAt: Date;
}

export interface QueueStats {
  totalInQueue: number;
  averageWaitTime: number;
  averageServiceTime: number;
  peopleBefore: number;
  peopleAfter: number;
  estimatedWaitTime: number;
}

// ============================================================================
// REVIEW EXTENDED TYPES
// ============================================================================

export interface ReviewExtended extends Review {
  photos: string[];
  helpfulCount: number;
  isHelpfulByCurrentUser: boolean;
  categories: ReviewCategory[];
}

export interface ReviewCategory {
  name: 'cleanliness' | 'service' | 'atmosphere' | 'value' | 'friendliness';
  rating: number;
}

// ============================================================================
// PAYMENT & TRANSACTION TYPES
// ============================================================================

export interface Transaction {
  id: string;
  bookingId: string;
  customerId: string;
  shopId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId?: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface SavedPaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: Date;
}

export interface Payout {
  id: string;
  shopId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: 'bank_transfer' | 'paypal';
  bankDetails?: BankDetails;
  requestedAt: Date;
  processedAt?: Date;
}

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  routingNumber?: string;
  swiftCode?: string;
}

// ============================================================================
// PROMOTION & LOYALTY TYPES
// ============================================================================

export interface Promotion {
  id: string;
  shopId: string;
  code: string;
  title: string;
  description: string;
  customerMessage: string;
  discountType: 'percentage' | 'fixed' | 'free_service' | 'buy_x_get_y';
  discountValue: number;
  applicableServices: string[] | 'all';
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  firstTimeOnly: boolean;
  validDays: number[];
  validTimeStart?: string;
  validTimeEnd?: string;
  maxTotalUses?: number;
  maxUsesPerCustomer: number;
  currentUses: number;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface LoyaltyProgram {
  id: string;
  shopId: string;
  isActive: boolean;
  pointsPerDollar: number;
  reviewBonusPoints: number;
  referralBonusPoints: number;
  birthdayBonusPoints: number;
  pointsValue: number; // e.g., 100 points = $1
  minRedeemPoints: number;
  tiers: LoyaltyTier[];
  rewards: LoyaltyReward[];
}

export interface LoyaltyTier {
  name: string;
  minPoints: number;
  benefits: string[];
  multiplier: number;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: 'discount' | 'free_service' | 'gift_card';
  value: number;
  isActive: boolean;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface DashboardStats {
  todayAppointments: number;
  activeQueueCount: number;
  estimatedEarningsToday: number;
  completedServices: number;
  cancelledAppointments: number;
  noShows: number;
}

export interface AnalyticsData {
  dateRange: { start: Date; end: Date };
  totalRevenue: number;
  revenueChange: number;
  totalAppointments: number;
  appointmentsChange: number;
  averageRating: number;
  newCustomers: number;
  repeatCustomerRate: number;
  averageServiceTime: number;
  noShowRate: number;
  cancellationRate: number;
  revenueByDay: { date: string; amount: number }[];
  bookingsByDay: { date: string; count: number }[];
  popularServices: { name: string; count: number; revenue: number }[];
  peakHours: { day: number; hour: number; intensity: number }[];
  barberPerformance?: BarberPerformance[];
}

export interface BarberPerformance {
  barberId: string;
  barberName: string;
  bookingsCompleted: number;
  revenue: number;
  averageRating: number;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface CommunicationPreferences {
  pushEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
  queuePositionUpdates: boolean;
  almostTurnAlerts: boolean;
  queueCancelled: boolean;
  bookingConfirmations: boolean;
  bookingReminders: boolean;
  bookingChanges: boolean;
  bookingCancellations: boolean;
  specialOffers: boolean;
  newShopAlerts: boolean;
  newsletter: boolean;
  reviewResponses: boolean;
  favoriteShopUpdates: boolean;
  dndEnabled: boolean;
  dndStartTime?: string;
  dndEndTime?: string;
}

export interface NotificationPayload {
  type: NotificationEventType;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export type NotificationEventType =
  | 'queue_position_update'
  | 'queue_almost_turn'
  | 'queue_your_turn'
  | 'queue_cancelled'
  | 'booking_confirmed'
  | 'booking_reminder_1day'
  | 'booking_reminder_1hour'
  | 'booking_changed'
  | 'booking_cancelled'
  | 'review_response'
  | 'promotion'
  | 'system';

// ============================================================================
// FORM TYPES
// ============================================================================

export interface CustomerSignUpForm {
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

export interface BarberSignUpForm {
  // Step 1: Personal Info
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
  password: string;
  confirmPassword: string;
  // Step 2: Shop Info
  shopName: string;
  shopDescription: string;
  shopCategory: string;
  businessRegistration?: string;
  // Step 3: Location
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  // Step 4: Operating Hours
  operatingDays: number[];
  openingTime: string;
  closingTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
}

export interface CreateBookingForm {
  shopId: string;
  services: { serviceId: string; quantity: number }[];
  barberId?: string;
  date: Date;
  time: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string;
  referencePhotos?: string[];
  paymentMethod: 'pay_at_shop' | 'pay_online';
}

export interface JoinQueueForm {
  shopId: string;
  services: string[];
  preferredBarberId?: string;
  notes?: string;
  phone: string;
}

export interface ServiceForm {
  name: string;
  description?: string;
  categoryId?: string;
  duration: number;
  price: number;
  discountPrice?: number;
  imageUrl?: string;
  isActive: boolean;
  availableFor: ('walkins' | 'bookings' | 'queue')[];
  prepTime?: number;
  cleanupTime?: number;
  maxAdvanceBookingDays?: number;
  depositRequired?: boolean;
  depositAmount?: number;
  cancellationNoticeHours?: number;
}

export interface PackageForm {
  name: string;
  description?: string;
  services: string[];
  originalPrice: number;
  packagePrice: number;
  validFrom?: Date;
  validUntil?: Date;
  maxUsesPerCustomer?: number;
  imageUrl?: string;
  isActive: boolean;
}
