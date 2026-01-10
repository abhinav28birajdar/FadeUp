/**
 * Shop Hooks
 * TanStack Query hooks for shop-related data fetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopService, Shop, Service, NearbyShop } from '../services/supabase';

// Query keys for cache management
export const shopKeys = {
  all: ['shops'] as const,
  lists: () => [...shopKeys.all, 'list'] as const,
  list: (filters: string) => [...shopKeys.lists(), { filters }] as const,
  details: () => [...shopKeys.all, 'detail'] as const,
  detail: (id: string) => [...shopKeys.details(), id] as const,
  nearby: (lat: number, lng: number, radius?: number) =>
    [...shopKeys.all, 'nearby', { lat, lng, radius }] as const,
  services: (shopId: string) => [...shopKeys.all, 'services', shopId] as const,
  barbers: (shopId: string) => [...shopKeys.all, 'barbers', shopId] as const,
  gallery: (shopId: string) => [...shopKeys.all, 'gallery', shopId] as const,
  featured: () => [...shopKeys.all, 'featured'] as const,
  search: (query: string) => [...shopKeys.all, 'search', query] as const,
};

/**
 * Hook to fetch all shops
 */
export function useShops() {
  return useQuery({
    queryKey: shopKeys.lists(),
    queryFn: () => shopService.getAllShops(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single shop by ID
 */
export function useShop(shopId: string) {
  return useQuery({
    queryKey: shopKeys.detail(shopId),
    queryFn: () => shopService.getShopById(shopId),
    enabled: !!shopId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch nearby shops
 */
export function useNearbyShops(
  latitude: number,
  longitude: number,
  radiusKm: number = 10
) {
  return useQuery({
    queryKey: shopKeys.nearby(latitude, longitude, radiusKm),
    queryFn: () => shopService.getNearbyShops(latitude, longitude, radiusKm),
    enabled: !!latitude && !!longitude,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch featured shops
 */
export function useFeaturedShops() {
  return useQuery({
    queryKey: shopKeys.featured(),
    queryFn: () => shopService.getFeaturedShops(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to search shops
 */
export function useSearchShops(query: string) {
  return useQuery({
    queryKey: shopKeys.search(query),
    queryFn: () => shopService.searchShops(query),
    enabled: query.length >= 2,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch shop services
 */
export function useShopServices(shopId: string) {
  return useQuery({
    queryKey: shopKeys.services(shopId),
    queryFn: () => shopService.getShopServices(shopId),
    enabled: !!shopId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch shop barbers
 */
export function useShopBarbers(shopId: string) {
  return useQuery({
    queryKey: shopKeys.barbers(shopId),
    queryFn: () => shopService.getShopBarbers(shopId),
    enabled: !!shopId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch shop gallery
 */
export function useShopGallery(shopId: string) {
  return useQuery({
    queryKey: shopKeys.gallery(shopId),
    queryFn: () => shopService.getShopGallery(shopId),
    enabled: !!shopId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to update shop profile (for shop owners)
 */
export function useUpdateShop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shopId, data }: { shopId: string; data: Partial<Shop> }) =>
      shopService.updateShop(shopId, data),
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: shopKeys.detail(variables.shopId) });
      queryClient.invalidateQueries({ queryKey: shopKeys.lists() });
    },
  });
}

/**
 * Hook to toggle shop open/closed status
 */
export function useToggleShopStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shopId, isOpen }: { shopId: string; isOpen: boolean }) =>
      shopService.updateShop(shopId, { is_open: isOpen }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: shopKeys.detail(variables.shopId) });
    },
  });
}

export default {
  useShops,
  useShop,
  useNearbyShops,
  useFeaturedShops,
  useSearchShops,
  useShopServices,
  useShopBarbers,
  useShopGallery,
  useUpdateShop,
  useToggleShopStatus,
};
