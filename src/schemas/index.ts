import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const otpVerificationSchema = z.object({
  phone: z.string().min(10, 'Please enter a valid phone number'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

// Profile schemas
export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address').optional(),
  phone: z.string().min(10, 'Please enter a valid phone number').optional(),
  language: z.enum(['en', 'hi', 'mr']).default('en'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
});

// Shop schemas
export const shopRegistrationSchema = z.object({
  name: z.string().min(2, 'Shop name must be at least 2 characters'),
  address: z.string().min(5, 'Please enter a complete address'),
  description: z.string().optional(),
  contactEmail: z.string().email('Please enter a valid email address').optional(),
  contactPhone: z.string().min(10, 'Please enter a valid phone number'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
  breakStartTime: z.string().optional(),
  breakEndTime: z.string().optional(),
  capacitySlots: z.number().min(1, 'Capacity must be at least 1').default(5),
});

export const serviceSchema = z.object({
  name: z.string().min(2, 'Service name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  durationMinutes: z.number().min(5, 'Duration must be at least 5 minutes'),
  categoryId: z.string().uuid('Invalid category ID'),
  isActive: z.boolean().default(true),
});

// Booking schemas
export const bookingSchema = z.object({
  shopId: z.string().uuid('Invalid shop ID'),
  barberId: z.string().uuid('Invalid barber ID').optional(),
  serviceIds: z.array(z.string().uuid()).min(1, 'Please select at least one service'),
  bookingTime: z.date().refine((date) => date > new Date(), {
    message: 'Booking time must be in the future',
  }),
  customerNotes: z.string().optional(),
});

// Review schemas
export const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(5, 'Review must be at least 5 characters').optional(),
});

// Settings schemas
export const supabaseConfigSchema = z.object({
  url: z.string().url('Please enter a valid Supabase URL'),
  anonKey: z.string().min(1, 'Anon key is required'),
});

export const notificationSettingsSchema = z.object({
  bookingReminders: z.boolean().default(true),
  queueUpdates: z.boolean().default(true),
  promotions: z.boolean().default(false),
  chatMessages: z.boolean().default(true),
});

// Type inference
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type OTPVerificationFormData = z.infer<typeof otpVerificationSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type ShopRegistrationFormData = z.infer<typeof shopRegistrationSchema>;
export type ServiceFormData = z.infer<typeof serviceSchema>;
export type BookingFormData = z.infer<typeof bookingSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type SupabaseConfigFormData = z.infer<typeof supabaseConfigSchema>;
export type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>;