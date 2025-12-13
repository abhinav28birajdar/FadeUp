import { getSupabase } from '../../config/supabase';
import { analyticsService } from '../analytics.service';

export interface Shop {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  address: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country: string;
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
  break_start_time?: string;
  break_end_time?: string;
  weekly_schedule?: any;
  capacity_slots: number;
  featured: boolean;
  verified: boolean;
  created_at: string;
  updated_at: string;
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
  created_at: string;
  updated_at: string;
}

export interface NearbyShop extends Shop {
  distance_km: number;
}

class ShopService {
  /**
   * Get all shops
   */
  async getAllShops(): Promise<Shop[]> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('status', 'active')
        .order('average_rating', { ascending: false });

      if (error) throw error;

      return (data as Shop[]) || [];
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  }

  /**
   * Get shop by ID
   */
  async getShopById(shopId: string): Promise<Shop | null> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('id', shopId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data as Shop | null;
    } catch (error) {
      console.error('Error getting shop:', error);
      return null;
    }
  }

  /**
   * Get nearby shops
   */
  async getNearbyShops(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    limit: number = 20
  ): Promise<NearbyShop[]> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase.rpc('get_nearby_shops', {
        user_lat: latitude,
        user_lon: longitude,
        radius_km: radiusKm,
        limit_count: limit,
      });

      if (error) throw error;

      analyticsService.trackEvent('shops_searched', {
        latitude,
        longitude,
        radiusKm,
        resultCount: data?.length || 0,
      });

      return (data as NearbyShop[]) || [];
    } catch (error) {
      console.error('Error getting nearby shops:', error);
      analyticsService.trackError(error as Error);
      return [];
    }
  }

  /**
   * Search shops by name or description
   */
  async searchShops(query: string): Promise<Shop[]> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('status', 'active')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('average_rating', { ascending: false })
        .limit(20);

      if (error) throw error;

      analyticsService.trackEvent('shops_searched', {
        query,
        resultCount: data?.length || 0,
      });

      return (data as Shop[]) || [];
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  }

  /**
   * Get shop services
   */
  async getShopServices(shopId: string): Promise<Service[]> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('shop_id', shopId)
        .eq('is_active', true)
        .order('popular', { ascending: false });

      if (error) throw error;

      return (data as Service[]) || [];
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  }

  /**
   * Create a new shop
   */
  async createShop(ownerId: string, shopData: Partial<Shop>): Promise<Shop> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('shops')
        .insert({
          owner_id: ownerId,
          ...shopData,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      analyticsService.trackEvent('shop_created', { shopId: data.id });

      return data as Shop;
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  }

  /**
   * Update shop
   */
  async updateShop(shopId: string, updates: Partial<Shop>): Promise<Shop> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('shops')
        .update(updates)
        .eq('id', shopId)
        .select()
        .single();

      if (error) throw error;

      analyticsService.trackEvent('shop_updated', { shopId });

      return data as Shop;
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  }

  /**
   * Toggle shop open/closed status
   */
  async toggleShopStatus(shopId: string, isOpen: boolean): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { error } = await supabase
        .from('shops')
        .update({ is_open: isOpen })
        .eq('id', shopId);

      if (error) throw error;

      analyticsService.trackEvent('shop_status_toggled', { shopId, isOpen });
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  }

  /**
   * Add/Update service
   */
  async upsertService(service: Partial<Service>): Promise<Service> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('services')
        .upsert(service)
        .select()
        .single();

      if (error) throw error;

      analyticsService.trackEvent('service_upserted', { serviceId: data.id });

      return data as Service;
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  }

  /**
   * Delete service
   */
  async deleteService(serviceId: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      analyticsService.trackEvent('service_deleted', { serviceId });
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  }

  /**
   * Get featured shops
   */
  async getFeaturedShops(limit: number = 10): Promise<Shop[]> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('status', 'active')
        .eq('featured', true)
        .order('average_rating', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data as Shop[]) || [];
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  }
}

export const shopService = new ShopService();
