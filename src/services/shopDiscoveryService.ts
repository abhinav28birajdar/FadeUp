import { supabase } from '../lib/supabase';
import { LocationCoords, locationService } from '../utils/locationService';

export interface Shop {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  phone: string;
  email?: string;
  website_url?: string;
  
  // Address and Location
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude: number;
  longitude: number;
  
  // Business Details
  business_license?: string;
  tax_id?: string;
  opening_hours: OpeningHours;
  special_hours?: OpeningHours;
  average_service_time: number;
  
  // Media
  logo_url?: string;
  cover_image_url?: string;
  gallery_images: string[];
  
  // Status
  is_verified: boolean;
  is_active: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  
  // Ratings
  total_ratings: number;
  average_rating: number;
  
  // Calculated fields
  distance_km?: number;
  is_open?: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
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

export interface Service {
  id: string;
  shop_id: string;
  category_id?: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  image_url?: string;
  is_popular: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon_name?: string;
  display_order: number;
  is_active: boolean;
}

export interface ShopWithServices extends Shop {
  services: Service[];
  categories: ServiceCategory[];
}

export interface ShopSearchOptions {
  searchQuery?: string;
  category?: 'barbershop' | 'salon' | 'spa';
  sortBy?: 'distance' | 'rating' | 'name';
  limit?: number;
}

export interface ShopSearchParams {
  userLocation: LocationCoords;
  radiusKm?: number;
  limit?: number;
  searchQuery?: string;
  minRating?: number;
  sortBy?: 'distance' | 'rating' | 'popularity';
  serviceCategory?: string;
}

export class ShopDiscoveryService {
  private static instance: ShopDiscoveryService;

  static getInstance(): ShopDiscoveryService {
    if (!ShopDiscoveryService.instance) {
      ShopDiscoveryService.instance = new ShopDiscoveryService();
    }
    return ShopDiscoveryService.instance;
  }

  /**
   * Find nearby shops based on user location
   */
  async findNearbyShops(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    options?: ShopSearchOptions
  ): Promise<Shop[]> {
    const params: ShopSearchParams = {
      userLocation: { latitude, longitude },
      radiusKm,
      limit: options?.limit || 20,
      searchQuery: options?.searchQuery,
      sortBy: options?.sortBy === 'name' ? 'popularity' : options?.sortBy || 'distance',
      serviceCategory: options?.category,
    };
    
    return this.findNearbyShopsInternal(params);
  }

  /**
   * Internal method for finding nearby shops
   */
  private async findNearbyShopsInternal(params: ShopSearchParams): Promise<Shop[]> {
    try {
      const {
        userLocation,
        radiusKm = 10,
        limit = 20,
        searchQuery,
        minRating = 0,
        sortBy = 'distance',
        serviceCategory,
      } = params;

      // Use the PostgreSQL function to find nearby shops
      let query = supabase.rpc('find_nearby_shops', {
        user_lat: userLocation.latitude,
        user_lng: userLocation.longitude,
        radius_km: radiusKm,
        limit_count: limit,
      });

      const { data: nearbyShops, error } = await query;

      if (error) {
        console.error('Error finding nearby shops:', error);
        throw error;
      }

      if (!nearbyShops || nearbyShops.length === 0) {
        return [];
      }

      // Get detailed shop information
      const shopIds = nearbyShops.map((shop: any) => shop.shop_id);
      
      let detailQuery = supabase
        .from('shops')
        .select(`
          *,
          services!inner(
            *,
            service_categories(*)
          )
        `)
        .in('id', shopIds)
        .eq('is_active', true)
        .eq('is_verified', true);

      // Apply filters
      if (minRating > 0) {
        detailQuery = detailQuery.gte('average_rating', minRating);
      }

      if (searchQuery) {
        detailQuery = detailQuery.or(
          `name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
      }

      if (serviceCategory) {
        detailQuery = detailQuery.eq('services.service_categories.name', serviceCategory);
      }

      const { data: shopsWithServices, error: detailError } = await detailQuery;

      if (detailError) {
        console.error('Error getting shop details:', detailError);
        throw detailError;
      }

      // Merge distance information and calculate additional fields
      const enrichedShops = shopsWithServices.map((shop: any) => {
        const nearbyShop = nearbyShops.find((ns: any) => ns.shop_id === shop.id);
        const distance = nearbyShop ? nearbyShop.distance_km : 0;

        return {
          ...shop,
          distance_km: Math.round(distance * 100) / 100, // Round to 2 decimal places
          is_open: this.isShopOpen(shop.opening_hours, shop.special_hours),
          gallery_images: shop.gallery_images || [],
        };
      });

      // Sort results
      const sortedShops = this.sortShops(enrichedShops, sortBy);

      return sortedShops;
    } catch (error) {
      console.error('Error in findNearbyShops:', error);
      throw new Error('Failed to find nearby shops');
    }
  }

  /**
   * Get shop details with services
   */
  async getShopDetails(shopId: string): Promise<ShopWithServices | null> {
    try {
      const { data: shop, error } = await supabase
        .from('shops')
        .select(`
          *,
          services(*),
          services(
            service_categories(*)
          )
        `)
        .eq('id', shopId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error getting shop details:', error);
        return null;
      }

      if (!shop) {
        return null;
      }

      // Get unique categories
      const categories = Array.from(
        new Map(
          shop.services
            .map((service: any) => service.service_categories)
            .filter(Boolean)
            .map((cat: ServiceCategory) => [cat.id, cat])
        ).values()
      );

      return {
        ...shop,
        gallery_images: shop.gallery_images || [],
        is_open: this.isShopOpen(shop.opening_hours, shop.special_hours),
        services: shop.services,
        categories,
      };
    } catch (error) {
      console.error('Error in getShopDetails:', error);
      return null;
    }
  }

  /**
   * Search shops by text query
   */
  async searchShops(
    query: string,
    userLocation?: LocationCoords,
    radiusKm: number = 50
  ): Promise<Shop[]> {
    try {
      if (!query.trim()) {
        return [];
      }

      let searchQuery = supabase
        .from('shops')
        .select('*')
        .eq('is_active', true)
        .eq('is_verified', true)
        .or(
          `name.ilike.%${query}%,description.ilike.%${query}%,city.ilike.%${query}%`
        )
        .limit(20);

      const { data: shops, error } = await searchQuery;

      if (error) {
        console.error('Error searching shops:', error);
        throw error;
      }

      if (!shops) {
        return [];
      }

      // Calculate distances if user location is provided
      let enrichedShops = shops.map((shop: any) => ({
        ...shop,
        gallery_images: shop.gallery_images || [],
        is_open: this.isShopOpen(shop.opening_hours, shop.special_hours),
        distance_km: userLocation
          ? locationService.calculateDistance(userLocation, {
              latitude: shop.latitude,
              longitude: shop.longitude,
            })
          : undefined,
      }));

      // Filter by radius if user location is provided
      if (userLocation) {
        enrichedShops = enrichedShops.filter(
          (shop) => !shop.distance_km || shop.distance_km <= radiusKm
        );
      }

      // Sort by distance if available, otherwise by rating
      enrichedShops.sort((a, b) => {
        if (a.distance_km !== undefined && b.distance_km !== undefined) {
          return a.distance_km - b.distance_km;
        }
        return b.average_rating - a.average_rating;
      });

      return enrichedShops;
    } catch (error) {
      console.error('Error in searchShops:', error);
      throw new Error('Failed to search shops');
    }
  }

  /**
   * Get service categories
   */
  async getServiceCategories(): Promise<ServiceCategory[]> {
    try {
      const { data: categories, error } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) {
        console.error('Error getting service categories:', error);
        throw error;
      }

      return categories || [];
    } catch (error) {
      console.error('Error in getServiceCategories:', error);
      return [];
    }
  }

  /**
   * Check if shop is currently open
   */
  private isShopOpen(
    openingHours: OpeningHours,
    specialHours?: OpeningHours
  ): boolean {
    const now = new Date();
    const dayNames = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const currentDay = dayNames[now.getDay()];
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    // Check special hours first (holidays, etc.)
    const todaySpecialHours = specialHours?.[currentDay as keyof OpeningHours];
    if (todaySpecialHours) {
      if (todaySpecialHours.closed) {
        return false;
      }
      return (
        currentTime >= todaySpecialHours.open &&
        currentTime <= todaySpecialHours.close
      );
    }

    // Check regular opening hours
    const todayHours = openingHours[currentDay as keyof OpeningHours];
    if (!todayHours || todayHours.closed) {
      return false;
    }

    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  }

  /**
   * Sort shops based on criteria
   */
  private sortShops(shops: Shop[], sortBy: string): Shop[] {
    return shops.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          if (a.distance_km === undefined) return 1;
          if (b.distance_km === undefined) return -1;
          return a.distance_km - b.distance_km;
        
        case 'rating':
          return b.average_rating - a.average_rating;
        
        case 'popularity':
          return b.total_ratings - a.total_ratings;
        
        default:
          return 0;
      }
    });
  }

  /**
   * Get shop operating status text
   */
  getOperatingStatus(shop: Shop): {
    isOpen: boolean;
    status: string;
    nextChange?: string;
  } {
    const isOpen = shop.is_open || false;
    
    if (isOpen) {
      return {
        isOpen: true,
        status: 'Open now',
      };
    }

    return {
      isOpen: false,
      status: 'Closed',
    };
  }

  /**
   * Format distance for display
   */
  formatDistance(distanceKm?: number): string {
    if (distanceKm === undefined) {
      return '';
    }

    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m away`;
    }

    return `${distanceKm.toFixed(1)}km away`;
  }
}

// Export singleton instance
export const shopDiscoveryService = ShopDiscoveryService.getInstance();