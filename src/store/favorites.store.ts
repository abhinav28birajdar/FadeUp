import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesStore {
    favoriteShopIds: string[];
    addFavorite: (shopId: string) => void;
    removeFavorite: (shopId: string) => void;
    isFavorite: (shopId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesStore>()(
    persist(
        (set, get) => ({
            favoriteShopIds: [],
            addFavorite: (shopId: string) =>
                set((state) => ({ favoriteShopIds: [...new Set([...state.favoriteShopIds, shopId])] })),
            removeFavorite: (shopId: string) =>
                set((state) => ({
                    favoriteShopIds: state.favoriteShopIds.filter((id) => id !== shopId),
                })),
            isFavorite: (shopId: string) => get().favoriteShopIds.includes(shopId),
        }),
        {
            name: 'favorites-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
