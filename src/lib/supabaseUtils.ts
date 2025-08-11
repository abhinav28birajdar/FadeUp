import { PostgrestError } from '@supabase/supabase-js';
import {
  Booking, BookingInsert,
  BookingWithDetails,
  Feedback, FeedbackInsert,
  QueueEntry, QueueEntryInsert,
  Service,
  ServiceInsert,
  Shop, ShopInsert,
  ShopWithDistance,
  UserProfile, UserProfileInsert
} from '../types/supabase';
import { supabase } from './supabase';

/**
 * Standard response format for all Supabase operations
 */
export interface SupabaseResponse<T> {
  data: T | null;
  error: PostgrestError | Error | null;
}

/**
 * User related functions
 */
export const userUtils = {
  /**
   * Get the current user profile
   */
  async getCurrentProfile(): Promise<SupabaseResponse<UserProfile>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('User not authenticated') };
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Get a user profile by ID
   */
  async getUserById(userId: string): Promise<SupabaseResponse<UserProfile>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Create or update a user profile
   */
  async upsertProfile(profile: UserProfileInsert): Promise<SupabaseResponse<UserProfile>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(profile)
        .select()
        .single();
        
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Update a user profile
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<SupabaseResponse<UserProfile>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
        
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  /**
   * Update user's push notification token
   */
  async updatePushToken(userId: string, token: string): Promise<SupabaseResponse<UserProfile>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ expo_push_token: token })
        .eq('id', userId)
        .select()
        .single();
        
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
};

/**
 * Shop related functions
 */
export const shopUtils = {
  /**
   * Get a shop by ID
   */
  async getShopById(shopId: string): Promise<SupabaseResponse<Shop>> {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('id', shopId)
        .single();
        
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Get all shops (optionally filtered by distance if coordinates provided)
   */
  async getAllShops(
    userLat?: number, 
    userLng?: number, 
    maxDistance?: number
  ): Promise<SupabaseResponse<ShopWithDistance[]>> {
    try {
      // If user coordinates are provided, use the get_nearby_shops function
      if (userLat !== undefined && userLng !== undefined) {
        const { data, error } = await supabase
          .rpc('get_nearby_shops', { 
            user_lat: userLat, 
            user_lng: userLng,
            radius_km: maxDistance || 20
          });
          
        return { data, error };
      }
      
      // Otherwise, fetch all active shops
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('is_active', true)
        .order('name');
        
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Create a new shop
   */
  async createShop(shop: ShopInsert): Promise<SupabaseResponse<Shop>> {
    try {
      const { data, error } = await supabase
        .from('shops')
        .insert(shop)
        .select()
        .single();
        
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Update an existing shop
   */
  async updateShop(shopId: string, updates: Partial<Shop>): Promise<SupabaseResponse<Shop>> {
    try {
      const { data, error } = await supabase
        .from('shops')
        .update(updates)
        .eq('id', shopId)
        .select()
        .single();
        
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  /**
   * Get shop by owner user ID
   */
  async getShopByOwnerId(userId: string): Promise<SupabaseResponse<Shop>> {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', userId)
        .single();
        
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Upload shop image to storage
   */
  async uploadShopImage(
    shopId: string, 
    uri: string, 
    fileType: string = 'image/jpeg'
  ): Promise<SupabaseResponse<string>> {
    try {
      const filename = `shop_${shopId}_${Date.now()}.jpg`;
      
      // Get the image data as a blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Upload to Supabase Storage
      const { data, error } = await supabase
        .storage
        .from('shop-images')
        .upload(filename, blob, {
          contentType: fileType,
          upsert: false
        });
        
      if (error) {
        return { data: null, error };
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('shop-images')
        .getPublicUrl(data.path);
        
      return { data: publicUrl, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Get shop details with services
   */
  async getShopDetails(shopId: string): Promise<SupabaseResponse<Shop & { services: Service[] }>> {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select(`
          *,
          services(*)
        `)
        .eq('id', shopId)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching shop details:', error);
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Get shops by location
   */
  async getShopsByLocation(
    latitude: number, 
    longitude: number, 
    radiusKm: number = 10
  ): Promise<SupabaseResponse<any>> {
    try {
      const { data, error } = await supabase.rpc('get_nearby_shops', {
        user_lat: latitude,
        user_lng: longitude,
        radius_km: radiusKm
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching nearby shops:', error);
      return { data: null, error: error as Error };
    }
  }
};

/**
 * Service related functions
 */
export const serviceUtils = {
  /**
   * Get a service by ID
   */
  async getServiceById(serviceId: string): Promise<SupabaseResponse<Service>> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();
        
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Get services by shop ID
   */
  async getServicesByShopId(shopId: string): Promise<SupabaseResponse<Service[]>> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('shop_id', shopId)
        .eq('is_active', true)
        .order('price');
        
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Create a new service
   */
  async createService(service: ServiceInsert): Promise<SupabaseResponse<Service>> {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert(service)
        .select()
        .single();
        
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Update an existing service
   */
  async updateService(serviceId: string, updates: Partial<Service>): Promise<SupabaseResponse<Service>> {
    try {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', serviceId)
        .select()
        .single();
        
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Delete a service
   */
  async deleteService(serviceId: string): Promise<SupabaseResponse<null>> {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);
        
      return { data: null, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Get services by IDs
   */
  async getServicesByIds(serviceIds: string[]): Promise<SupabaseResponse<Service[]>> {
    try {
      if (!serviceIds.length) {
        return { data: [], error: null };
      }
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .in('id', serviceIds);
        
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
};

/**
 * Booking related functions
 */
export const bookingUtils = {
  /**
   * Get a booking by ID with details
   */
  async getBookingById(bookingId: string): Promise<SupabaseResponse<BookingWithDetails>> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:customer_id(*),
          shop:shop_id(*)
        `)
        .eq('id', bookingId)
        .single();
        
      // If booking found, fetch associated services
      if (data && data.service_ids?.length) {
        const { data: services } = await serviceUtils.getServicesByIds(data.service_ids);
        
        // Add services to the booking
        return {
          data: { ...data, services },
          error
        };
      }
        
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Get bookings by customer ID
   */
  async getBookingsByCustomerId(
    customerId: string,
    status?: string | string[]
  ): Promise<SupabaseResponse<BookingWithDetails[]>> {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          shop:shop_id(id, name, address, image_url, average_rating)
        `)
        .eq('customer_id', customerId)
        .order('booking_date', { ascending: false });
        
      // Filter by status if provided
      if (status) {
        if (Array.isArray(status)) {
          query = query.in('status', status);
        } else {
          query = query.eq('status', status);
        }
      }
      
      const { data, error } = await query;
      
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Get bookings by shop ID
   */
  async getBookingsByShopId(
    shopId: string,
    status?: string | string[],
    date?: string
  ): Promise<SupabaseResponse<BookingWithDetails[]>> {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          customer:customer_id(id, first_name, last_name, avatar_url, phone_number)
        `)
        .eq('shop_id', shopId)
        .order('booking_date', { ascending: true })
        .order('slot_time', { ascending: true });
        
      // Filter by status if provided
      if (status) {
        if (Array.isArray(status)) {
          query = query.in('status', status);
        } else {
          query = query.eq('status', status);
        }
      }
      
      // Filter by date if provided
      if (date) {
        query = query.eq('booking_date', date);
      }
      
      const { data, error } = await query;
      
      // If bookings found, fetch associated services
      if (data && data.length) {
        // Get all unique service IDs from all bookings
        const allServiceIds = Array.from(
          new Set(data.flatMap(booking => booking.service_ids || []))
        );
        
        // Fetch all services in a single query
        const { data: services } = await serviceUtils.getServicesByIds(allServiceIds);
        
        if (services) {
          // Create a map for quick lookup
          const serviceMap = new Map(services.map(service => [service.id, service]));
          
          // Add services to each booking
          const bookingsWithServices = data.map(booking => ({
            ...booking,
            services: (booking.service_ids || [])
              .map((id: string) => serviceMap.get(id))
              .filter(Boolean)
          }));
          
          return { data: bookingsWithServices, error };
        }
      }
      
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Create a new booking
   */
  async createBooking(booking: BookingInsert): Promise<SupabaseResponse<Booking>> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert(booking)
        .select()
        .single();
        
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Update an existing booking
   */
  async updateBookingStatus(
    bookingId: string, 
    status: Booking['status']
  ): Promise<SupabaseResponse<Booking>> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId)
        .select()
        .single();
        
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Create booking and queue entry in a transaction-like manner
   */
  async createBookingWithQueueEntry(
    booking: BookingInsert,
    shopId: string
  ): Promise<SupabaseResponse<{ booking: Booking; queueEntry: QueueEntry }>> {
    try {
      // 1. Create the booking
      const { data: newBooking, error: bookingError } = await bookingUtils.createBooking(booking);
      
      if (bookingError || !newBooking) {
        return { data: null, error: bookingError || new Error('Failed to create booking') };
      }
      
      // 2. Get next queue position
      const { data: nextPosition } = await supabase
        .rpc('get_next_queue_position', { shop_uuid: shopId });
      
      const queuePosition = nextPosition || 1;
      
      // 3. Create queue entry
      const queueEntry: QueueEntryInsert = {
        booking_id: newBooking.id,
        customer_id: booking.customer_id,
        shop_id: booking.shop_id,
        position: queuePosition,
        status: 'waiting'
      };
      
      const { data: newQueueEntry, error: queueError } = await supabase
        .from('queue')
        .insert(queueEntry)
        .select()
        .single();
      
      if (queueError || !newQueueEntry) {
        // If queue entry creation fails, we still return the booking
        return { 
          data: { booking: newBooking, queueEntry: null as unknown as QueueEntry },
          error: queueError
        };
      }
      
      return { 
        data: { booking: newBooking, queueEntry: newQueueEntry },
        error: null 
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Legacy function to create a booking
   */
  async createLegacyBooking(bookingData: {
    customer_id: string;
    shop_id: string;
    service_id: string;
    booking_date: string;
    booking_time: string;
    total_price: number;
    notes?: string;
  }): Promise<SupabaseResponse<any>> {
    try {
      // Convert to new format with service_ids array
      const newBookingData = {
        customer_id: bookingData.customer_id,
        shop_id: bookingData.shop_id,
        service_ids: [bookingData.service_id],
        booking_date: bookingData.booking_date,
        slot_time: bookingData.booking_time,
        total_price: bookingData.total_price,
        notes: bookingData.notes,
        status: 'pending' as const
      };
      
      const { data, error } = await supabase
        .from('bookings')
        .insert([newBookingData])
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating booking:', error);
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Legacy function to get user bookings
   */
  async getUserBookings(userId: string): Promise<SupabaseResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          shop:shop_id(name, address),
          services:service_ids(name, duration)
        `)
        .eq('customer_id', userId)
        .order('booking_date', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return { data: null, error: error as Error };
    }
  }
};

/**
 * Queue related functions
 */
export const queueUtils = {
  /**
   * Get queue entries by shop ID
   */
  async getQueueByShopId(shopId: string): Promise<SupabaseResponse<QueueEntry[]>> {
    try {
      const { data, error } = await supabase
        .from('queue')
        .select('*')
        .eq('shop_id', shopId)
        .in('status', ['waiting', 'in_progress', 'ready_next'])
        .order('position');
        
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Get queue entries by customer ID
   */
  async getQueueByCustomerId(customerId: string): Promise<SupabaseResponse<QueueEntry[]>> {
    try {
      const { data, error } = await supabase
        .from('queue')
        .select('*')
        .eq('customer_id', customerId)
        .in('status', ['waiting', 'in_progress', 'ready_next'])
        .order('created_at', { ascending: false });
        
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Get a queue entry by booking ID
   */
  async getQueueEntryByBookingId(bookingId: string): Promise<SupabaseResponse<QueueEntry>> {
    try {
      const { data, error } = await supabase
        .from('queue')
        .select('*')
        .eq('booking_id', bookingId)
        .single();
        
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Update a queue entry's status
   */
  async updateQueueStatus(
    queueId: string, 
    status: QueueEntry['status'],
    updateBookingStatus: boolean = false
  ): Promise<SupabaseResponse<QueueEntry>> {
    try {
      let updates: Partial<QueueEntry> = { status };
      
      // If marking as in_progress, set the start time
      if (status === 'in_progress') {
        updates.in_progress_start_time = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('queue')
        .update(updates)
        .eq('id', queueId)
        .select()
        .single();
      
      if (error || !data) {
        return { data, error };
      }
      
      // If requested, also update the associated booking status
      if (updateBookingStatus && data.booking_id) {
        let bookingStatus: Booking['status'];
        
        // Map queue status to booking status
        switch (status) {
          case 'in_progress':
            bookingStatus = 'in_progress';
            break;
          case 'completed':
            bookingStatus = 'completed';
            break;
          case 'skipped':
            bookingStatus = 'cancelled';
            break;
          default:
            bookingStatus = 'confirmed';
        }
        
        await bookingUtils.updateBookingStatus(data.booking_id, bookingStatus);
      }
      
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Legacy function to join queue
   */
  async joinQueue(queueData: {
    shop_id: string;
    customer_id: string;
    booking_id: string;
  }): Promise<SupabaseResponse<any>> {
    try {
      // Get next queue position
      const { data: nextPosition } = await supabase
        .rpc('get_next_queue_position', { shop_uuid: queueData.shop_id });
      
      const position = nextPosition || 1;
      
      // Calculate estimated wait time
      const estimatedWaitTime = await supabase.rpc('calculate_estimated_wait_time', {
        shop_id_param: queueData.shop_id,
        position_param: position
      });
  
      const { data, error } = await supabase
        .from('queue')
        .insert([{
          ...queueData,
          position,
          status: 'waiting',
          estimated_wait_time: estimatedWaitTime.data || 0
        }])
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error joining queue:', error);
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Legacy function to get queue status
   */
  async getQueueStatus(shopId: string, customerId?: string): Promise<SupabaseResponse<any>> {
    try {
      let query = supabase
        .from('queue')
        .select(`
          *,
          users:customer_id(first_name, last_name, avatar_url),
          bookings:booking_id(
            service_ids,
            total_price,
            notes
          )
        `)
        .eq('shop_id', shopId)
        .in('status', ['waiting', 'in_service', 'ready_next'])
        .order('position', { ascending: true });
  
      const { data, error } = await query;
      
      if (error) throw error;
  
      // If customer ID is provided, find their position
      let customerPosition = null;
      if (customerId && data) {
        const customerInQueue = data.find(item => item.customer_id === customerId);
        customerPosition = customerInQueue?.position || null;
      }
  
      // Return a custom response object that includes the customer position
      return { 
        data: { queueData: data, customerPosition }, 
        error: null 
      };
    } catch (error) {
      console.error('Error fetching queue status:', error);
      return { 
        data: null, 
        error: error as Error 
      };
    }
  },
  
  /**
   * Check if a shop has any in_progress queue entries
   */
  async hasActiveInServiceEntry(shopId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('queue')
        .select('id')
        .eq('shop_id', shopId)
        .eq('status', 'in_progress')
        .limit(1);
        
      return !error && !!data?.length;
    } catch (error) {
      console.error('Error checking in-progress entries:', error);
      return false;
    }
  }
};

/**
 * Feedback related functions
 */
export const feedbackUtils = {
  /**
   * Get feedback by shop ID
   */
  async getFeedbackByShopId(shopId: string): Promise<SupabaseResponse<Feedback[]>> {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          customer:customer_id(id, first_name, last_name, avatar_url)
        `)
        .eq('shop_id', shopId)
        .order('submitted_at', { ascending: false });
        
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Get feedback by customer ID
   */
  async getFeedbackByCustomerId(customerId: string): Promise<SupabaseResponse<Feedback[]>> {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          shop:shop_id(id, name, image_url)
        `)
        .eq('customer_id', customerId)
        .order('submitted_at', { ascending: false });
        
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Get feedback for a specific booking
   */
  async getFeedbackByBookingId(bookingId: string): Promise<SupabaseResponse<Feedback>> {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('booking_id', bookingId)
        .single();
        
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Create or update feedback for a booking
   */
  async upsertFeedback(feedback: FeedbackInsert): Promise<SupabaseResponse<Feedback>> {
    try {
      // Check if feedback already exists for this booking
      const { data: existingFeedback } = await feedbackUtils.getFeedbackByBookingId(
        feedback.booking_id
      );
      
      if (existingFeedback) {
        // Update existing feedback
        const { data, error } = await supabase
          .from('feedback')
          .update({
            rating: feedback.rating,
            comment: feedback.comment,
            submitted_at: new Date().toISOString()
          })
          .eq('booking_id', feedback.booking_id)
          .select()
          .single();
          
        return { data, error };
      } else {
        // Create new feedback
        const { data, error } = await supabase
          .from('feedback')
          .insert({
            ...feedback,
            submitted_at: new Date().toISOString()
          })
          .select()
          .single();
          
        return { data, error };
      }
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Legacy function to create review
   */
  async createReview(reviewData: {
    booking_id: string;
    customer_id: string;
    shop_id: string;
    rating: number;
    comment?: string;
  }): Promise<SupabaseResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .insert([{
          ...reviewData,
          submitted_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating review:', error);
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Legacy function to get shop reviews
   */
  async getShopReviews(shopId: string): Promise<SupabaseResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          customer:customer_id(first_name, last_name, avatar_url)
        `)
        .eq('shop_id', shopId)
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching shop reviews:', error);
      return { data: null, error: error as Error };
    }
  }
};

/**
 * Storage related functions
 */
export const storageUtils = {
  /**
   * Upload user avatar image
   */
  async uploadAvatar(
    userId: string, 
    uri: string,
    fileType: string = 'image/jpeg'
  ): Promise<SupabaseResponse<string>> {
    try {
      const filename = `avatar_${userId}_${Date.now()}.jpg`;
      
      // Get the image data as a blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Upload to Supabase Storage
      const { data, error } = await supabase
        .storage
        .from('avatars')
        .upload(filename, blob, {
          contentType: fileType,
          upsert: false
        });
        
      if (error) {
        return { data: null, error };
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(data.path);
      
      // Update the user's avatar_url
      await userUtils.updateProfile(userId, { avatar_url: publicUrl });
        
      return { data: publicUrl, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
};

/**
 * Notifications related functions
 */
export const notificationsUtils = {
  /**
   * Get unread notifications for a user
   */
  async getUnreadNotifications(userId: string): Promise<SupabaseResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });
        
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Mark a notification as read
   */
  async markNotificationRead(notificationId: string): Promise<SupabaseResponse<null>> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
        
      return { data: null, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Mark all notifications as read for a user
   */
  async markAllNotificationsRead(userId: string): Promise<SupabaseResponse<null>> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
        
      return { data: null, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Legacy function to send notification
   */
  async sendNotification(notificationData: {
    user_id: string;
    title: string;
    message: string;
    type: string;
    data?: any;
  }): Promise<SupabaseResponse<any>> {
    try {
      const { data, error } = await supabase.rpc('send_notification', {
        user_id_param: notificationData.user_id,
        title_param: notificationData.title,
        message_param: notificationData.message,
        type_param: notificationData.type,
        data_param: notificationData.data || null
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error sending notification:', error);
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Legacy function to get user notifications
   */
  async getUserNotifications(userId: string): Promise<SupabaseResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { data: null, error: error as Error };
    }
  },
  
  /**
   * Legacy function to mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<SupabaseResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { data: null, error: error as Error };
    }
  }
};

export default {
  userUtils,
  shopUtils,
  serviceUtils,
  bookingUtils,
  queueUtils,
  feedbackUtils,
  storageUtils,
  notificationsUtils
};