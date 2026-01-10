import { AuthError, Session, User } from '@supabase/supabase-js';
import { getSupabase } from '../../config/supabase';
import { LoginFormData, SignupFormData } from '../../types';

export class SupabaseAuthService {
  /**
   * Sign up with email and password
   */
  static async signUp(data: SignupFormData): Promise<{ user: User | null; session: Session | null; error: AuthError | null }> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.name,
          role: data.role,
          phone: data.phone,
        },
      },
    });

    if (error) {
      return { user: null, session: null, error };
    }

    // Create profile
    if (authData.user) {
      await supabase.from('profiles').insert({
        id: authData.user.id,
        email: data.email,
        full_name: data.name,
        role: data.role,
        phone: data.phone,
      });
    }

    return { user: authData.user, session: authData.session, error: null };
  }

  /**
   * Sign in with email and password
   */
  static async signIn(data: LoginFormData): Promise<{ user: User | null; session: Session | null; error: AuthError | null }> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    return { user: authData.user, session: authData.session, error };
  }

  /**
   * Sign out
   */
  static async signOut(): Promise<{ error: AuthError | null }> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase.auth.signOut();
    return { error };
  }

  /**
   * Get current session
   */
  static async getSession(): Promise<Session | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data } = await supabase.auth.getSession();
    return data.session;
  }

  /**
   * Get current user
   */
  static async getUser(): Promise<User | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data } = await supabase.auth.getUser();
    return data.user;
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (user: User | null, session: Session | null) => void) {
    const supabase = getSupabase();
    if (!supabase) return () => {};

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null, session);
    });

    return () => subscription.unsubscribe();
  }

  /**
   * Get user profile
   */
  static async getProfile(userId: string): Promise<{ data: any; error: any }> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    return { data, error };
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: any): Promise<any> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  }

  /**
   * Update user password
   */
  static async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  }

  /**
   * Update user email
   */
  static async updateEmail(newEmail: string): Promise<{ error: AuthError | null }> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    });
    return { error };
  }

  /**
   * Verify phone number with OTP
   */
  static async verifyPhone(phone: string, code: string): Promise<{ error: AuthError | null }> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: code,
      type: 'sms',
    });
    return { error };
  }

  /**
   * Send phone verification code
   */
  static async sendPhoneVerification(phone: string): Promise<{ error: AuthError | null }> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });
    return { error };
  }

  /**
   * Sign in with OAuth provider
   */
  static async signInWithOAuth(provider: 'google' | 'apple' | 'facebook'): Promise<{ error: AuthError | null }> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
    });
    return { error };
  }
}

export type AuthUser = User;
