import { create } from "zustand";
import { User } from "firebase/auth";
import { UserProfile } from "@/types/firebaseModels";

interface AuthState {
  role: "customer" | "shopkeeper" | "unauthenticated";
  user: UserProfile | null;
  firebaseUser: User | null;
  setRole: (role: "customer" | "shopkeeper" | "unauthenticated") => void;
  setUser: (user: UserProfile | null) => void;
  setFirebaseUser: (user: User | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  role: "unauthenticated",
  user: null,
  firebaseUser: null,
  
  setRole: (role) => set({ role }),
  
  setUser: (user) => set({ user }),
  
  setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
  
  clearAuth: () => set({
    role: "unauthenticated",
    user: null,
    firebaseUser: null,
  }),
}));