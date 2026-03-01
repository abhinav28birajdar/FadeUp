import { create } from 'zustand';
import { UserProfile } from '../types/firestore.types';

interface AuthStore {
    user: UserProfile | null;
    isLoading: boolean;
    setUser: (user: UserProfile | null) => void;
    setLoading: (loading: boolean) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    isLoading: true,
    setUser: (user) => set({ user }),
    setLoading: (isLoading) => set({ isLoading }),
    clearAuth: () => set({ user: null, isLoading: false }),
}));
