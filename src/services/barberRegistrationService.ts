import { supabase } from '../lib/supabase';
import { locationService } from '../utils/locationService';

export interface BarberRegistrationData {
  // Personal Information
  full_name: string;
  email: string;
  phone: string;
  profile_image_url?: string;
  
  // Shop Information
  shop_name: string;
  shop_description?: string;
  shop_phone: string;
  shop_email?: string;
  website_url?: string;
  
  // Address and Location
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  
  // Business Details
  business_license?: string;
  tax_id?: string;
  years_of_experience?: number;
  
  // Media
  shop_logo_url?: string;
  shop_cover_image_url?: string;
  gallery_images?: string[];
  
  // Operating Hours
  opening_hours: OpeningHours;
  
  // Services
  services: ServiceRegistrationData[];
}

export interface ServiceRegistrationData {
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  category?: string;
  image_url?: string;
}

export interface OpeningHours {
  monday?: { open: string; close: string; closed?: boolean };
  tuesday?: { open: string; close: string; closed?: boolean };
  wednesday?: { open: string; close: string; closed?: boolean };
  thursday?: { open: string; close: string; closed?: boolean };
  friday?: { open: string; close: string; closed?: boolean };
  saturday?: { open: string; close: string; closed?: boolean };
  sunday?: { open: string; close: string; closed?: boolean };
}

export interface RegistrationStep {
  id: string;
  title: string;
  description: string;
  component: string;
  isRequired: boolean;
  isCompleted: boolean;
}

export class BarberRegistrationService {
  private static instance: BarberRegistrationService;

  static getInstance(): BarberRegistrationService {
    if (!BarberRegistrationService.instance) {
      BarberRegistrationService.instance = new BarberRegistrationService();
    }
    return BarberRegistrationService.instance;
  }

  /**
   * Get registration steps
   */
  getRegistrationSteps(): RegistrationStep[] {
    return [
      {
        id: 'personal_info',
        title: 'Personal Information',
        description: 'Tell us about yourself',
        component: 'PersonalInfoStep',
        isRequired: true,
        isCompleted: false,
      },
      {
        id: 'shop_details',
        title: 'Shop Details',
        description: 'Information about your barbershop',
        component: 'ShopDetailsStep',
        isRequired: true,
        isCompleted: false,
      },
      {
        id: 'location',
        title: 'Location & Address',
        description: 'Where is your shop located?',
        component: 'LocationStep',
        isRequired: true,
        isCompleted: false,
      },
      {
        id: 'business_info',
        title: 'Business Information',
        description: 'Business license and tax details',
        component: 'BusinessInfoStep',
        isRequired: false,
        isCompleted: false,
      },
      {
        id: 'services',
        title: 'Services & Pricing',
        description: 'What services do you offer?',
        component: 'ServicesStep',
        isRequired: true,
        isCompleted: false,
      },
      {
        id: 'hours',
        title: 'Operating Hours',
        description: 'When are you open?',
        component: 'HoursStep',
        isRequired: true,
        isCompleted: false,
      },
      {
        id: 'media',
        title: 'Photos & Media',
        description: 'Show off your work',
        component: 'MediaStep',
        isRequired: false,
        isCompleted: false,
      },
      {
        id: 'review',
        title: 'Review & Submit',
        description: 'Review your information',
        component: 'ReviewStep',
        isRequired: true,
        isCompleted: false,
      },
    ];
  }

  /**
   * Validate email uniqueness
   */
  async validateEmail(email: string): Promise<{ isValid: boolean; message?: string }> {
    try {
      // Check if email already exists in users table
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        // PGRST116 is "not found" which is what we want
        throw userError;
      }

      if (existingUser) {
        return {
          isValid: false,
          message: 'This email is already registered. Please use a different email.',
        };
      }

      // Check if email already exists in shops table
      const { data: existingShop, error: shopError } = await supabase
        .from('shops')
        .select('id')
        .eq('email', email)
        .single();

      if (shopError && shopError.code !== 'PGRST116') {
        throw shopError;
      }

      if (existingShop) {
        return {
          isValid: false,
          message: 'This email is already associated with another shop.',
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error validating email:', error);
      return {
        isValid: false,
        message: 'Unable to validate email. Please try again.',
      };
    }
  }

  /**
   * Validate phone number uniqueness
   */
  async validatePhone(phone: string): Promise<{ isValid: boolean; message?: string }> {
    try {
      const { data: existingShop, error } = await supabase
        .from('shops')
        .select('id')
        .eq('phone', phone)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (existingShop) {
        return {
          isValid: false,
          message: 'This phone number is already registered.',
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error validating phone:', error);
      return {
        isValid: false,
        message: 'Unable to validate phone number. Please try again.',
      };
    }
  }

  /**
   * Geocode address to get coordinates
   */
  async geocodeAddress(address: {
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  }): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const fullAddress = `${address.street_address}, ${address.city}, ${address.state} ${address.postal_code}, ${address.country}`;
      const coordinates = await locationService.geocodeAddress(fullAddress);
      return coordinates;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }

  /**
   * Upload image to Supabase storage
   */
  async uploadImage(
    imageUri: string,
    bucket: string,
    fileName: string
  ): Promise<{ url: string | null; error?: string }> {
    try {
      // Convert image URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Error uploading image:', error);
        return { url: null, error: error.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return { url: urlData.publicUrl };
    } catch (error) {
      console.error('Error in uploadImage:', error);
      return { url: null, error: 'Failed to upload image' };
    }
  }

  /**
   * Submit barber registration
   */
  async submitRegistration(
    registrationData: BarberRegistrationData,
    userId: string
  ): Promise<{ success: boolean; shopId?: string; error?: string }> {
    try {
      // Start a transaction-like operation
      const {
        full_name,
        email,
        phone,
        profile_image_url,
        shop_name,
        shop_description,
        shop_phone,
        shop_email,
        website_url,
        street_address,
        city,
        state,
        postal_code,
        country,
        business_license,
        tax_id,
        years_of_experience,
        shop_logo_url,
        shop_cover_image_url,
        gallery_images,
        opening_hours,
        services,
      } = registrationData;

      // 1. Geocode the address
      const coordinates = await this.geocodeAddress({
        street_address,
        city,
        state,
        postal_code,
        country,
      });

      if (!coordinates) {
        return {
          success: false,
          error: 'Unable to find the specified address. Please check and try again.',
        };
      }

      // 2. Update user profile
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({
          full_name,
          phone,
          profile_image_url,
          user_type: 'barber',
          years_of_experience,
        })
        .eq('id', userId);

      if (userUpdateError) {
        console.error('Error updating user profile:', userUpdateError);
        return {
          success: false,
          error: 'Failed to update user profile. Please try again.',
        };
      }

      // 3. Create the shop
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .insert({
          owner_id: userId,
          name: shop_name,
          description: shop_description,
          phone: shop_phone,
          email: shop_email || email,
          website_url,
          street_address,
          city,
          state,
          postal_code,
          country,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          business_license,
          tax_id,
          opening_hours,
          logo_url: shop_logo_url,
          cover_image_url: shop_cover_image_url,
          gallery_images: gallery_images || [],
          is_verified: false,
          is_active: true,
          verification_status: 'pending',
          average_service_time: Math.round(
            services.reduce((acc, service) => acc + service.duration_minutes, 0) / services.length
          ),
        })
        .select()
        .single();

      if (shopError) {
        console.error('Error creating shop:', shopError);
        return {
          success: false,
          error: 'Failed to create shop. Please try again.',
        };
      }

      const shopId = shopData.id;

      // 4. Create services
      if (services.length > 0) {
        const serviceInserts = services.map((service, index) => ({
          shop_id: shopId,
          name: service.name,
          description: service.description,
          duration_minutes: service.duration_minutes,
          price: service.price,
          image_url: service.image_url,
          is_popular: index < 3, // Mark first 3 services as popular
          is_active: true,
          display_order: index + 1,
        }));

        const { error: servicesError } = await supabase
          .from('services')
          .insert(serviceInserts);

        if (servicesError) {
          console.error('Error creating services:', servicesError);
          // Don't fail the whole registration, just log the error
        }
      }

      // 5. Create initial queue configuration
      const { error: queueError } = await supabase
        .from('queue_settings')
        .insert({
          shop_id: shopId,
          max_queue_size: 10,
          average_service_time: Math.round(
            services.reduce((acc, service) => acc + service.duration_minutes, 0) / services.length
          ),
          is_queue_enabled: true,
          notification_settings: {
            notify_on_join: true,
            notify_on_turn: true,
            notify_minutes_before: 5,
          },
        });

      if (queueError) {
        console.error('Error creating queue settings:', queueError);
      }

      return {
        success: true,
        shopId,
      };
    } catch (error) {
      console.error('Error in submitRegistration:', error);
      return {
        success: false,
        error: 'Registration failed. Please try again.',
      };
    }
  }

  /**
   * Save registration progress
   */
  async saveRegistrationProgress(
    userId: string,
    stepId: string,
    data: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const key = `registration_${userId}_${stepId}`;
      
      // In a real app, you might want to save this to a database table
      // For now, we'll use a simple approach
      const { error } = await supabase
        .from('user_metadata')
        .upsert({
          user_id: userId,
          key,
          value: data,
        });

      if (error) {
        console.error('Error saving registration progress:', error);
        return {
          success: false,
          error: 'Failed to save progress',
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in saveRegistrationProgress:', error);
      return {
        success: false,
        error: 'Failed to save progress',
      };
    }
  }

  /**
   * Load registration progress
   */
  async loadRegistrationProgress(
    userId: string,
    stepId: string
  ): Promise<{ data: any | null; error?: string }> {
    try {
      const key = `registration_${userId}_${stepId}`;
      
      const { data, error } = await supabase
        .from('user_metadata')
        .select('value')
        .eq('user_id', userId)
        .eq('key', key)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading registration progress:', error);
        return {
          data: null,
          error: 'Failed to load progress',
        };
      }

      return { data: data?.value || null };
    } catch (error) {
      console.error('Error in loadRegistrationProgress:', error);
      return {
        data: null,
        error: 'Failed to load progress',
      };
    }
  }

  /**
   * Clear registration progress
   */
  async clearRegistrationProgress(userId: string): Promise<void> {
    try {
      await supabase
        .from('user_metadata')
        .delete()
        .eq('user_id', userId)
        .like('key', 'registration_%');
    } catch (error) {
      console.error('Error clearing registration progress:', error);
    }
  }

  /**
   * Get service categories for selection
   */
  async getServiceCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('name')
        .eq('is_active', true)
        .order('display_order');

      if (error) {
        console.error('Error fetching service categories:', error);
        return this.getDefaultServiceCategories();
      }

      return data?.map(cat => cat.name) || this.getDefaultServiceCategories();
    } catch (error) {
      console.error('Error in getServiceCategories:', error);
      return this.getDefaultServiceCategories();
    }
  }

  /**
   * Get default service categories
   */
  private getDefaultServiceCategories(): string[] {
    return [
      'Haircut',
      'Beard Trim',
      'Shave',
      'Hair Wash',
      'Styling',
      'Color',
      'Treatment',
      'Package Deal',
    ];
  }

  /**
   * Validate registration data
   */
  validateRegistrationData(data: Partial<BarberRegistrationData>): {
    isValid: boolean;
    errors: { [key: string]: string };
  } {
    const errors: { [key: string]: string } = {};

    // Personal Information
    if (!data.full_name?.trim()) {
      errors.full_name = 'Full name is required';
    }

    if (!data.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!data.phone?.trim()) {
      errors.phone = 'Phone number is required';
    }

    // Shop Information
    if (!data.shop_name?.trim()) {
      errors.shop_name = 'Shop name is required';
    }

    if (!data.shop_phone?.trim()) {
      errors.shop_phone = 'Shop phone number is required';
    }

    // Address
    if (!data.street_address?.trim()) {
      errors.street_address = 'Street address is required';
    }

    if (!data.city?.trim()) {
      errors.city = 'City is required';
    }

    if (!data.state?.trim()) {
      errors.state = 'State is required';
    }

    if (!data.postal_code?.trim()) {
      errors.postal_code = 'Postal code is required';
    }

    if (!data.country?.trim()) {
      errors.country = 'Country is required';
    }

    // Services
    if (!data.services || data.services.length === 0) {
      errors.services = 'At least one service is required';
    } else {
      data.services.forEach((service, index) => {
        if (!service.name?.trim()) {
          errors[`service_${index}_name`] = `Service ${index + 1} name is required`;
        }
        if (!service.duration_minutes || service.duration_minutes <= 0) {
          errors[`service_${index}_duration`] = `Service ${index + 1} duration must be greater than 0`;
        }
        if (!service.price || service.price <= 0) {
          errors[`service_${index}_price`] = `Service ${index + 1} price must be greater than 0`;
        }
      });
    }

    // Opening Hours
    if (!data.opening_hours) {
      errors.opening_hours = 'Operating hours are required';
    } else {
      const hasAnyOpenDay = Object.values(data.opening_hours).some(
        (day) => day && !day.closed && day.open && day.close
      );
      
      if (!hasAnyOpenDay) {
        errors.opening_hours = 'At least one operating day is required';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const barberRegistrationService = BarberRegistrationService.getInstance();