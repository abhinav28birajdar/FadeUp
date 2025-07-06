import { create } from 'zustand';
import { User } from 'firebase/auth';
import { UserProfile, UserRole } from '@/src/types/firebaseModels';

interface AuthState {
  role: UserRole;
  user: UserProfile | null;
  firebaseUser: User | null;
  setRole: (role: UserRole) => void;
  setUser: (user: UserProfile | null) => void;
  setFirebaseUser: (user: User | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  role: 'unauthenticated',
  user: null,
  firebaseUser: null,
  
  setRole: (role) => set({ role }),
  
  setUser: (user) => set({ 
    user,
    role: user?.role || 'unauthenticated'
  }),
  
  setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
  
  clearAuth: () => set({
    role: 'unauthenticated',
    user: null,
    firebaseUser: null
  })
}));