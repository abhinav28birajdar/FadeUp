import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { SupabaseAuthService } from '../services/supabase';
import { analyticsService } from '../services/analytics.service';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: 'customer' | 'barber' | 'admin';
  shop_id?: string;
  is_onboarded: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  supabaseUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = SupabaseAuthService.onAuthStateChange(async (supaUser, session) => {
      setSupabaseUser(supaUser);
      
      if (supaUser) {
        // Fetch full profile
        try {
          const profile = await getProfile(supaUser.id);
          setUser(profile);
        } catch (error) {
          console.error('Error fetching profile:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const getProfile = async (userId: string): Promise<AuthUser | null> => {
    try {
      const { data, error } = await SupabaseAuthService.getProfile(userId);
      if (error) throw error;
      return data as AuthUser;
    } catch (error) {
      console.error('Error in getProfile:', error);
      return null;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await SupabaseAuthService.signIn({ email, password });
      
      if (result.error) throw result.error;
      if (result.user) {
        const profile = await getProfile(result.user.id);
        setUser(profile);
        analyticsService.trackEvent('user_signed_in');
      }
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: any) => {
    try {
      setLoading(true);
      const result = await SupabaseAuthService.signUp(data);
      
      if (result.error) throw result.error;
      if (result.user) {
        const profile = await getProfile(result.user.id);
        setUser(profile);
        analyticsService.trackEvent('user_signed_up');
      }
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await SupabaseAuthService.signOut();
      setUser(null);
      setSupabaseUser(null);
      analyticsService.trackEvent('user_signed_out');
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<AuthUser>) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const updated = await SupabaseAuthService.updateProfile(user.id, updates);
      setUser({ ...user, ...updated });
      analyticsService.trackEvent('profile_updated');
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    supabaseUser,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
