/**
 * Authentication Hooks
 * TanStack Query hooks for auth-related operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { SupabaseAuthService } from '../services/supabase';
import { getSupabase } from '../config/supabase';
import { LoginFormData, SignupFormData } from '../types';

// Query keys
export const authKeys = {
  session: ['auth', 'session'] as const,
  user: ['auth', 'user'] as const,
  profile: (userId: string) => ['auth', 'profile', userId] as const,
};

/**
 * Hook to manage authentication state
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  // Get current session
  const {
    data: session,
    isLoading: isSessionLoading,
    refetch: refetchSession,
  } = useQuery({
    queryKey: authKeys.session,
    queryFn: () => SupabaseAuthService.getSession(),
    staleTime: Infinity, // Session doesn't go stale
  });

  // Subscribe to auth state changes
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setIsInitialized(true);
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        queryClient.setQueryData(authKeys.session, newSession);
      } else if (event === 'SIGNED_OUT') {
        queryClient.setQueryData(authKeys.session, null);
        queryClient.removeQueries();
      }
    });

    setIsInitialized(true);

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const user = session?.user ?? null;
  const isAuthenticated = !!session;

  return {
    session,
    user,
    isAuthenticated,
    isLoading: isSessionLoading || !isInitialized,
    refetchSession,
  };
}

/**
 * Hook to get current user profile
 */
export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: authKeys.profile(userId || ''),
    queryFn: async () => {
      if (!userId) return null;
      const supabase = getSupabase();
      if (!supabase) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for sign up
 */
export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignupFormData) => SupabaseAuthService.signUp(data),
    onSuccess: (result) => {
      if (result.session) {
        queryClient.setQueryData(authKeys.session, result.session);
      }
    },
  });
}

/**
 * Hook for sign in
 */
export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginFormData) => SupabaseAuthService.signIn(data),
    onSuccess: (result) => {
      if (result.session) {
        queryClient.setQueryData(authKeys.session, result.session);
      }
    },
  });
}

/**
 * Hook for sign out
 */
export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => SupabaseAuthService.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(authKeys.session, null);
      queryClient.removeQueries();
    },
  });
}

/**
 * Hook for password reset
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: (email: string) => SupabaseAuthService.resetPassword(email),
  });
}

/**
 * Hook for updating password
 */
export function useUpdatePassword() {
  return useMutation({
    mutationFn: (newPassword: string) =>
      SupabaseAuthService.updatePassword(newPassword),
  });
}

/**
 * Hook for updating user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: Record<string, any>;
    }) => {
      const supabase = getSupabase();
      if (!supabase) throw new Error('Supabase not initialized');

      const { data: profile, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return profile;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: authKeys.profile(variables.userId),
      });
    },
  });
}

/**
 * Hook for phone verification
 */
export function useVerifyPhone() {
  return useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) =>
      SupabaseAuthService.verifyPhone(phone, code),
  });
}

/**
 * Hook for sending phone verification code
 */
export function useSendPhoneVerification() {
  return useMutation({
    mutationFn: (phone: string) => SupabaseAuthService.sendPhoneVerification(phone),
  });
}

/**
 * Hook for OAuth sign in
 */
export function useOAuthSignIn() {
  return useMutation({
    mutationFn: (provider: 'google' | 'apple' | 'facebook') =>
      SupabaseAuthService.signInWithOAuth(provider),
  });
}

export default {
  useAuth,
  useUserProfile,
  useSignUp,
  useSignIn,
  useSignOut,
  useResetPassword,
  useUpdatePassword,
  useUpdateProfile,
  useVerifyPhone,
  useSendPhoneVerification,
  useOAuthSignIn,
};
