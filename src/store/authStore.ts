import { Session } from '@supabase/supabase-js';
import { create } from 'zustand';
import { UserProfile } from '../types/supabase';

interface AuthState {
  role: 'customer' | 'shopkeeper' | 'unauthenticated';
  user: UserProfile | null;
  session: Session | null;
  setRole: (role: 'customer' | 'shopkeeper' | 'unauthenticated') => void;
  setUser: (user: UserProfile | null) => void;
  setSession: (session: Session | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  role: 'unauthenticated',
  user: null,
  session: null,
  setRole: (role) => set({ role }),
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  clearAuth: () => set({ 
    role: 'unauthenticated', 
    user: null, 
    session: null 
  }),
}));
