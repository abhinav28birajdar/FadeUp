import { supabase } from './supabase';

// Shop-related utilities
export const getShopsByLocation = async (latitude: number, longitude: number, radiusKm: number = 10) => {
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
    return { data: null, error };
  }
};

export const getShopDetails = async (shopId: string) => {
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
    return { data: null, error };
  }
};

// Booking utilities
export const createBooking = async (bookingData: {
  customer_id: string;
  shop_id: string;
  service_id: string;
  booking_date: string;
  booking_time: string;
  total_price: number;
  notes?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { data: null, error };
  }
};

export const getUserBookings = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        shops(name, address),
        services(name, duration)
      `)
      .eq('customer_id', userId)
      .order('booking_date', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return { data: null, error };
  }
};

// Queue utilities
export const joinQueue = async (queueData: {
  shop_id: string;
  customer_id: string;
  booking_id: string;
}) => {
  try {
    // Get current queue position
    const { data: queueCount, error: countError } = await supabase
      .from('queue')
      .select('*', { count: 'exact' })
      .eq('shop_id', queueData.shop_id)
      .eq('status', 'waiting');

    if (countError) throw countError;

    const position = (queueCount?.length || 0) + 1;

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
        estimated_wait_time: estimatedWaitTime.data || 0
      }])
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error joining queue:', error);
    return { data: null, error };
  }
};

export const getQueueStatus = async (shopId: string, customerId?: string) => {
  try {
    let query = supabase
      .from('queue')
      .select(`
        *,
        users:customer_id(full_name),
        bookings:booking_id(
          services:service_id(name, duration)
        )
      `)
      .eq('shop_id', shopId)
      .in('status', ['waiting', 'in_service'])
      .order('position', { ascending: true });

    const { data, error } = await query;
    
    if (error) throw error;

    // If customer ID is provided, find their position
    let customerPosition = null;
    if (customerId) {
      const customerInQueue = data?.find(item => item.customer_id === customerId);
      customerPosition = customerInQueue?.position || null;
    }

    return { data, error: null, customerPosition };
  } catch (error) {
    console.error('Error fetching queue status:', error);
    return { data: null, error, customerPosition: null };
  }
};

// Notification utilities
export const sendNotification = async (notificationData: {
  user_id: string;
  title: string;
  message: string;
  type: string;
  data?: any;
}) => {
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
    return { data: null, error };
  }
};

export const getUserNotifications = async (userId: string) => {
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
    return { data: null, error };
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { data: null, error };
  }
};

// Review utilities
export const createReview = async (reviewData: {
  booking_id: string;
  customer_id: string;
  shop_id: string;
  rating: number;
  comment?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([reviewData])
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating review:', error);
    return { data: null, error };
  }
};

export const getShopReviews = async (shopId: string) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        users:customer_id(full_name)
      `)
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching shop reviews:', error);
    return { data: null, error };
  }
};