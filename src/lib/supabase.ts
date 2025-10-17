import { logger } from '@/src/utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  logger.error('Supabase environment variables not set!');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: AsyncStorage,
  },
});

// Add utility for logging Supabase API operations
export const logSupabaseOperation = (operation: string, table: string, data: any, error?: any) => {
  if (error) {
    logger.error(`Supabase ${operation} error on ${table}`, { error, data });
  } else {
    logger.debug(`Supabase ${operation} on ${table}`, { data });
  }
};

// Add utility for executing Supabase operations with logging
export const executeWithLogging = async <T>(
  operation: string,
  table: string,
  supabasePromise: Promise<{ data: T | null; error: any }>,
): Promise<{ data: T | null; error: any }> => {
  try {
    const result = await supabasePromise;
    
    if (result.error) {
      logSupabaseOperation(operation, table, null, result.error);
    } else {
      logSupabaseOperation(operation, table, result.data);
    }
    
    return result;
  } catch (error) {
    logSupabaseOperation(operation, table, null, error);
    return { data: null, error };
  }
};
