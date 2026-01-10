/**
 * Firestore compatibility layer
 * Re-exports Supabase services for backwards compatibility
 */
import { getSupabase } from '../config/supabase';

export { bookingService, queueService, reviewService, shopService } from './supabase';
export type { Booking, CreateBookingData, NearbyShop, QueuePosition, QueueStats, Service, Shop } from './supabase';

// Create a service service based on shopService for backwards compatibility
export const serviceService = {
  getServicesByShop: async (shopId: string) => {
    const { shopService } = await import('./supabase');
    return shopService.getServices(shopId);
  },
  
  create: async (serviceData: {
    shopId: string;
    title: string;
    description?: string;
    price: number;
    durationMinutes: number;
    isActive: boolean;
  }): Promise<string> => {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from('services')
      .insert({
        shop_id: serviceData.shopId,
        title: serviceData.title,
        description: serviceData.description,
        price: serviceData.price,
        duration_minutes: serviceData.durationMinutes,
        is_active: serviceData.isActive,
      })
      .select('id')
      .single();
      
    if (error) throw error;
    return data.id;
  },
  
  update: async (serviceId: string, serviceData: {
    title?: string;
    description?: string;
    price?: number;
    durationMinutes?: number;
    isActive?: boolean;
  }): Promise<void> => {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');
    
    const updateData: Record<string, any> = {};
    if (serviceData.title !== undefined) updateData.title = serviceData.title;
    if (serviceData.description !== undefined) updateData.description = serviceData.description;
    if (serviceData.price !== undefined) updateData.price = serviceData.price;
    if (serviceData.durationMinutes !== undefined) updateData.duration_minutes = serviceData.durationMinutes;
    if (serviceData.isActive !== undefined) updateData.is_active = serviceData.isActive;
    
    const { error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', serviceId);
      
    if (error) throw error;
  },
  
  delete: async (serviceId: string): Promise<void> => {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);
      
    if (error) throw error;
  },
};
