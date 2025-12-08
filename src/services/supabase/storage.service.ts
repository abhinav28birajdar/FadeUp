import { getSupabase } from '../../config/supabase';

export class SupabaseStorageService {
  /**
   * Upload a file to storage
   */
  static async uploadFile(
    bucket: string,
    path: string,
    file: File | Blob,
    options?: { contentType?: string; cacheControl?: string; upsert?: boolean }
  ): Promise<string> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: options?.contentType,
        cacheControl: options?.cacheControl || '3600',
        upsert: options?.upsert || false,
      });

    if (error) throw error;
    return data.path;
  }

  /**
   * Get public URL for a file
   */
  static getPublicUrl(bucket: string, path: string): string {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /**
   * Download a file from storage
   */
  static async downloadFile(bucket: string, path: string): Promise<Blob> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error) throw error;
    return data;
  }

  /**
   * Delete a file from storage
   */
  static async deleteFile(bucket: string, paths: string[]): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths);

    if (error) throw error;
  }

  /**
   * List files in a bucket
   */
  static async listFiles(bucket: string, path?: string, options?: { limit?: number; offset?: number; sortBy?: any }): Promise<any[]> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path, options);

    if (error) throw error;
    return data || [];
  }

  /**
   * Create a signed URL for private files
   */
  static async createSignedUrl(bucket: string, path: string, expiresIn: number = 3600): Promise<string> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  }
}
