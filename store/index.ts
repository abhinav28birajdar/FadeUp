import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type Profile = {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

interface AuthState {
  // State
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  
  // Actions
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      session: null,
      user: null,
      profile: null,
      loading: true,

      // Actions
      setSession: (session) => {
        set({ session, user: session?.user || null });
      },
      
      setProfile: (profile) => {
        set({ profile });
      },
      
      setLoading: (loading) => {
        set({ loading });
      },
      
      logout: () => {
        set({ session: null, user: null, profile: null });
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist profile, session is handled by Supabase
        profile: state.profile,
      }),
    }
  )
);

// App State Store
interface AppState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Location
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
  
  // Navigation
  currentRoute: string | null;
  
  // Queue
  activeBooking: {
    id: string;
    shopId: string;
    queuePosition?: number;
    estimatedWaitTime?: number;
  } | null;
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setUserLocation: (location: { latitude: number; longitude: number } | null) => void;
  setCurrentRoute: (route: string) => void;
  setActiveBooking: (booking: AppState['activeBooking']) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      theme: 'system',
      userLocation: null,
      currentRoute: null,
      activeBooking: null,

      // Actions
      setTheme: (theme) => set({ theme }),
      setUserLocation: (location) => set({ userLocation: location }),
      setCurrentRoute: (route) => set({ currentRoute: route }),
      setActiveBooking: (booking) => set({ activeBooking: booking }),
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Notifications State
interface NotificationState {
  unreadCount: number;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
  }>;
  
  // Actions
  setUnreadCount: (count: number) => void;
  addNotification: (notification: NotificationState['notifications'][0]) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  // Initial state
  unreadCount: 0,
  notifications: [],

  // Actions
  setUnreadCount: (count) => set({ unreadCount: count }),
  
  addNotification: (notification) => 
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
    })),
    
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
    
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));

// Queue State for real-time updates
interface QueueState {
  queueData: {
    [shopId: string]: Array<{
      id: string;
      customerId: string;
      currentPosition: number;
      estimatedWaitTime?: number;
      status: 'waiting' | 'serving' | 'completed' | 'left_queue';
    }>;
  };
  
  // Actions
  updateQueue: (shopId: string, queueData: QueueState['queueData'][string]) => void;
  updatePosition: (shopId: string, customerId: string, position: number, waitTime?: number) => void;
  removeFromQueue: (shopId: string, customerId: string) => void;
}

export const useQueueStore = create<QueueState>()((set) => ({
  // Initial state
  queueData: {},

  // Actions
  updateQueue: (shopId, queueData) =>
    set((state) => ({
      queueData: {
        ...state.queueData,
        [shopId]: queueData,
      },
    })),
    
  updatePosition: (shopId, customerId, position, waitTime) =>
    set((state) => ({
      queueData: {
        ...state.queueData,
        [shopId]: (state.queueData[shopId] || []).map(item =>
          item.customerId === customerId
            ? { ...item, currentPosition: position, estimatedWaitTime: waitTime }
            : item
        ),
      },
    })),
    
  removeFromQueue: (shopId, customerId) =>
    set((state) => ({
      queueData: {
        ...state.queueData,
        [shopId]: (state.queueData[shopId] || []).filter(
          item => item.customerId !== customerId
        ),
      },
    })),
}));