/**
 * FadeUp Navigation Types
 * Comprehensive type definitions for all navigation routes
 */

import { NavigatorScreenParams } from '@react-navigation/native';

// ============================================================================
// AUTH FLOW TYPES
// ============================================================================

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Welcome: undefined;
  UserTypeSelection: undefined;
  SignIn: undefined;
  SignUp: { userType: 'customer' | 'barber' };
  BarberSignUp: { step?: number };
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  EmailVerification: { email: string };
  PhoneVerification: { phone: string };
};

// ============================================================================
// CUSTOMER APP TYPES
// ============================================================================

export type CustomerTabParamList = {
  Home: undefined;
  Bookings: undefined;
  Queue: undefined;
  Favorites: undefined;
  Profile: undefined;
};

export type CustomerHomeStackParamList = {
  HomeMain: undefined;
  Search: { query?: string };
  ShopDetail: { shopId: string };
  BarberProfile: { barberId: string; shopId: string };
  MapView: { latitude?: number; longitude?: number };
  Filters: undefined;
};

export type CustomerBookingsStackParamList = {
  BookingsMain: undefined;
  BookingDetail: { bookingId: string };
  CreateBooking: { shopId: string; barberId?: string };
  BookingConfirmation: { bookingId: string };
  RescheduleBooking: { bookingId: string };
  CancelBooking: { bookingId: string };
};

export type CustomerQueueStackParamList = {
  QueueMain: undefined;
  QueueDetail: { queueId: string };
  JoinQueue: { shopId: string };
  QueueHistory: undefined;
};

export type CustomerFavoritesStackParamList = {
  FavoritesMain: undefined;
  Collections: undefined;
  CollectionDetail: { collectionId: string };
};

export type CustomerProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;
  AccountSecurity: undefined;
  LinkedAccounts: undefined;
  BookingHistory: undefined;
  ReviewHistory: undefined;
  PaymentHistory: undefined;
  SavedPaymentMethods: undefined;
  AddPaymentMethod: undefined;
  LoyaltyPoints: undefined;
  PromoCodes: undefined;
  HelpCenter: undefined;
  ContactSupport: undefined;
  ReportProblem: undefined;
  LanguageSettings: undefined;
  ThemeSettings: undefined;
  AboutApp: undefined;
  WriteReview: { shopId: string; bookingId?: string };
  EditReview: { reviewId: string };
};

// ============================================================================
// BARBER APP TYPES
// ============================================================================

export type BarberTabParamList = {
  Dashboard: undefined;
  Queue: undefined;
  Bookings: undefined;
  Shop: undefined;
  More: undefined;
};

export type BarberDashboardStackParamList = {
  DashboardMain: undefined;
  Analytics: undefined;
};

export type BarberQueueStackParamList = {
  QueueManagement: undefined;
  QueueCustomerDetail: { queueId: string };
  AddWalkIn: undefined;
  QueueSettings: undefined;
};

export type BarberBookingsStackParamList = {
  BookingsCalendar: undefined;
  BookingDetail: { bookingId: string };
  CreateBooking: undefined;
  EditBooking: { bookingId: string };
  CancelBooking: { bookingId: string };
  MarkComplete: { bookingId: string };
  NoShowManagement: { bookingId: string };
};

export type BarberShopStackParamList = {
  ShopProfile: undefined;
  EditShopDetails: undefined;
  ServicesManagement: undefined;
  AddEditService: { serviceId?: string };
  OperatingHours: undefined;
  BarberManagement: undefined;
  AddEditBarber: { barberId?: string };
  ReviewManagement: undefined;
  RespondToReview: { reviewId: string };
};

export type BarberMoreStackParamList = {
  MoreMenu: undefined;
  CustomerDatabase: undefined;
  CustomerProfile: { customerId: string };
  EarningsPayouts: undefined;
  RequestPayout: undefined;
  TransactionHistory: undefined;
  PricingPackages: undefined;
  CreateEditPackage: { packageId?: string };
  PromotionsOffers: undefined;
  CreateEditPromotion: { promotionId?: string };
  LoyaltyProgram: undefined;
  BookingPolicies: undefined;
  PaymentSettings: undefined;
  TaxSettings: undefined;
  ShopVisibility: undefined;
  ShopQRCode: undefined;
  NotificationSettings: undefined;
  HelpCenter: undefined;
  ContactSupport: undefined;
  LanguageSettings: undefined;
  ThemeSettings: undefined;
  AboutApp: undefined;
};

// ============================================================================
// ROOT NAVIGATION TYPE
// ============================================================================

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  CustomerApp: NavigatorScreenParams<CustomerTabParamList>;
  BarberApp: NavigatorScreenParams<BarberTabParamList>;
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ShopFilter = {
  distance?: number;
  minRating?: number;
  maxPrice?: number;
  minPrice?: number;
  services?: string[];
  openNow?: boolean;
  acceptsWalkIns?: boolean;
  amenities?: string[];
  sortBy?: 'distance' | 'rating' | 'price_low' | 'price_high' | 'wait_time' | 'popular';
};

export type BookingFilter = {
  status?: 'all' | 'upcoming' | 'past' | 'cancelled';
  dateFrom?: Date;
  dateTo?: Date;
  shopId?: string;
};

export type QueueFilter = {
  status?: 'active' | 'history' | 'all';
  dateFrom?: Date;
  dateTo?: Date;
};

export type CustomerFilter = {
  type?: 'all' | 'vip' | 'new' | 'inactive';
  sortBy?: 'name' | 'recent_visit' | 'total_visits' | 'total_spent';
};

// ============================================================================
// SCREEN PROPS HELPERS
// ============================================================================

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
