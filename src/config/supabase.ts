import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { configManager } from './ConfigManager';

let supabaseClient: SupabaseClient | null = null;

/**
 * Initialize Supabase client with stored configuration
 */
export async function initializeSupabase(): Promise<SupabaseClient | null> {
  try {
    const config = await configManager.loadConfig();
    
    if (!config || !config.supabaseUrl || !config.supabaseAnonKey) {
      console.warn('Supabase not configured');
      return null;
    }

    if (supabaseClient) {
      return supabaseClient;
    }

    supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });

    return supabaseClient;
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    return null;
  }
}

/**
 * Get the initialized Supabase client
 */
export function getSupabase(): SupabaseClient | null {
  return supabaseClient;
}

/**
 * Reset Supabase client (useful after config changes)
 */
export function resetSupabase(): void {
  supabaseClient = null;
}

export { supabaseClient };
