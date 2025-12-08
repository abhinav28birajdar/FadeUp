import { create } from 'zustand';
import { QueueItem, Shop } from '../types';

interface QueueState {
  queueItems: QueueItem[];
  currentShop: Shop | null;
  myPosition: number | null;
  estimatedWait: number | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setQueueItems: (items: QueueItem[]) => void;
  addQueueItem: (item: QueueItem) => void;
  updateQueueItem: (id: string, updates: Partial<QueueItem>) => void;
  removeQueueItem: (id: string) => void;
  setCurrentShop: (shop: Shop | null) => void;
  setMyPosition: (position: number | null) => void;
  setEstimatedWait: (wait: number | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  queueItems: [],
  currentShop: null,
  myPosition: null,
  estimatedWait: null,
  isLoading: false,
  error: null,

  setQueueItems: (queueItems) => set({ queueItems }),
  
  addQueueItem: (item) => set((state) => ({
    queueItems: [...state.queueItems, item]
  })),
  
  updateQueueItem: (id, updates) => set((state) => ({
    queueItems: state.queueItems.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    )
  })),
  
  removeQueueItem: (id) => set((state) => ({
    queueItems: state.queueItems.filter((item) => item.id !== id)
  })),
  
  setCurrentShop: (currentShop) => set({ currentShop }),
  
  setMyPosition: (myPosition) => set({ myPosition }),
  
  setEstimatedWait: (estimatedWait) => set({ estimatedWait }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  reset: () => set({
    queueItems: [],
    currentShop: null,
    myPosition: null,
    estimatedWait: null,
    isLoading: false,
    error: null
  }),
}));
