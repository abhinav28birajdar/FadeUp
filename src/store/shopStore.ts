import { create } from 'zustand';
import { Shop } from '../types';

interface ShopState {
  shops: Shop[];
  nearbyShops: Shop[];
  favoriteShops: Shop[];
  selectedShop: Shop | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filters: {
    rating: number | null;
    distance: number | null;
    isOpen: boolean | null;
  };
  
  // Actions
  setShops: (shops: Shop[]) => void;
  setNearbyShops: (shops: Shop[]) => void;
  setFavoriteShops: (shops: Shop[]) => void;
  setSelectedShop: (shop: Shop | null) => void;
  addFavorite: (shopId: string) => void;
  removeFavorite: (shopId: string) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<ShopState['filters']>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useShopStore = create<ShopState>((set) => ({
  shops: [],
  nearbyShops: [],
  favoriteShops: [],
  selectedShop: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  filters: {
    rating: null,
    distance: null,
    isOpen: null,
  },

  setShops: (shops) => set({ shops }),
  
  setNearbyShops: (nearbyShops) => set({ nearbyShops }),
  
  setFavoriteShops: (favoriteShops) => set({ favoriteShops }),
  
  setSelectedShop: (selectedShop) => set({ selectedShop }),
  
  addFavorite: (shopId) => set((state) => {
    const shop = state.shops.find(s => s.id === shopId);
    if (shop && !state.favoriteShops.find(s => s.id === shopId)) {
      return { favoriteShops: [...state.favoriteShops, shop] };
    }
    return state;
  }),
  
  removeFavorite: (shopId) => set((state) => ({
    favoriteShops: state.favoriteShops.filter(s => s.id !== shopId)
  })),
  
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  reset: () => set({
    shops: [],
    nearbyShops: [],
    selectedShop: null,
    searchQuery: '',
    filters: {
      rating: null,
      distance: null,
      isOpen: null,
    },
  }),
}));
