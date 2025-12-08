import { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabase } from '../../config/supabase';

export class SupabaseDatabaseService {
  /**
   * Generic get operation
   */
  static async get<T>(table: string, filters?: Record<string, any>): Promise<T[]> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    let query = supabase.from(table).select('*');

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as T[];
  }

  /**
   * Generic get by ID
   */
  static async getById<T>(table: string, id: string): Promise<T | null> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as T;
  }

  /**
   * Generic insert operation
   */
  static async insert<T>(table: string, record: Partial<T>): Promise<T> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from(table)
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data as T;
  }

  /**
   * Generic update operation
   */
  static async update<T>(table: string, id: string, updates: Partial<T>): Promise<T> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as T;
  }

  /**
   * Generic delete operation
   */
  static async delete(table: string, id: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Subscribe to real-time changes
   */
  static subscribe<T>(
    table: string,
    callback: (payload: { eventType: string; new: T; old: T }) => void,
    filter?: string
  ): RealtimeChannel | null {
    const supabase = getSupabase();
    if (!supabase) return null;

    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        },
        (payload: any) => callback(payload)
      )
      .subscribe();

    return channel;
  }

  /**
   * Unsubscribe from real-time changes
   */
  static async unsubscribe(channel: RealtimeChannel): Promise<void> {
    const supabase = getSupabase();
    if (!supabase || !channel) return;

    await supabase.removeChannel(channel);
  }

  /**
   * Execute custom query
   */
  static async query<T>(query: (supabase: any) => any): Promise<T> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await query(supabase);
    if (error) throw error;
    return data as T;
  }
}
