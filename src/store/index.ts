// src/store/index.ts
import { create } from 'zustand';
import { User, UserRole } from '../types'; // Import your types

interface AppState {
  userRole: UserRole | null;
  setUserRole: (role: UserRole | null) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  userRole: null,
  setUserRole: (role) => set({ userRole: role }),
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
}));