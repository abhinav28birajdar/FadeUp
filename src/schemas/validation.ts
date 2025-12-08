import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[\d\s\-()]+$/, 'Invalid phone number').optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  role: z.enum(['customer', 'barber']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Profile schemas
export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().regex(/^\+?[\d\s\-()]+$/, 'Invalid phone number').optional(),
  avatar_url: z.string().url('Invalid URL').optional(),
});

// Shop schemas
export const createShopSchema = z.object({
  name: z.string().min(2, 'Shop name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required').optional(),
  zip_code: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid zip code').optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  contact_email: z.string().email('Invalid email').optional(),
  contact_phone: z.string().regex(/^\+?[\d\s\-()]+$/, 'Invalid phone number'),
  opening_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  closing_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
});

export const updateShopSchema = createShopSchema.partial();

// Service schemas
export const createServiceSchema = z.object({
  name: z.string().min(2, 'Service name must be at least 2 characters'),
  description: z.string().max(300, 'Description must be less than 300 characters').optional(),
  price: z.number().positive('Price must be positive'),
  duration_minutes: z.number().int().positive('Duration must be a positive integer'),
  category_id: z.string().uuid('Invalid category ID').optional(),
  image_url: z.string().url('Invalid URL').optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

// Booking schemas
export const createBookingSchema = z.object({
  shop_id: z.string().uuid('Invalid shop ID'),
  barber_id: z.string().uuid('Invalid barber ID').optional(),
  service_ids: z.array(z.string().uuid('Invalid service ID')).min(1, 'At least one service required'),
  booking_time: z.date().refine((date) => date > new Date(), {
    message: 'Booking time must be in the future',
  }),
  customer_notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

// Review schemas
export const createReviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().min(10, 'Review must be at least 10 characters').max(500, 'Review must be less than 500 characters'),
});

// Config schemas
export const appConfigSchema = z.object({
  supabaseUrl: z.string().url('Invalid Supabase URL'),
  supabaseAnonKey: z.string().min(1, 'Supabase anon key is required'),
  firebaseApiKey: z.string().optional(),
  firebaseAuthDomain: z.string().optional(),
  firebaseProjectId: z.string().optional(),
});

// Queue schemas
export const joinQueueSchema = z.object({
  shop_id: z.string().uuid('Invalid shop ID'),
  service_ids: z.array(z.string().uuid('Invalid service ID')).min(1, 'At least one service required'),
  notes: z.string().max(300, 'Notes must be less than 300 characters').optional(),
});

// Search schemas
export const searchShopsSchema = z.object({
  query: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radius_km: z.number().positive().max(50).default(10),
  rating: z.number().min(0).max(5).optional(),
  is_open: z.boolean().optional(),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type CreateShopFormData = z.infer<typeof createShopSchema>;
export type UpdateShopFormData = z.infer<typeof updateShopSchema>;
export type CreateServiceFormData = z.infer<typeof createServiceSchema>;
export type UpdateServiceFormData = z.infer<typeof updateServiceSchema>;
export type CreateBookingFormData = z.infer<typeof createBookingSchema>;
export type CreateReviewFormData = z.infer<typeof createReviewSchema>;
export type AppConfigFormData = z.infer<typeof appConfigSchema>;
export type JoinQueueFormData = z.infer<typeof joinQueueSchema>;
export type SearchShopsFormData = z.infer<typeof searchShopsSchema>;
