// src/lib/supabase.ts
import 'react-native-url-polyfill/auto'; // Required for Supabase in React Native
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants'; // For accessing environment variables
import * as SecureStore from 'expo-secure-store'; // For secure auth storage

// Retrieve environment variables securely
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string;

// Secure storage for Supabase auth session
const storage = {
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },
  getItem: async (key: string) => {
    return await SecureStore.getItemAsync(key);
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage as any, // Cast to any to satisfy the type, SecureStore is compatible
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});