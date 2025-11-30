import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AuthService } from '../services/auth';
import { AuthContextType, User } from '../types';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const user = await AuthService.signInWithEmail({ email, password });
      setUser(user);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (data: any) => {
    try {
      setLoading(true);
      const user = await AuthService.signUpWithEmail(data);
      setUser(user);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in');
      await AuthService.updateUserProfile(user.id, data);
      setUser({ ...user, ...data });
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
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