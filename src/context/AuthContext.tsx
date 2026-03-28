import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { User as FirebaseUser } from 'firebase/auth';
import { signIn as firebaseSignIn, signUp as firebaseSignUp, logout as firebaseLogout, onAuthStateChange, getUserProfile, UserProfile } from '../auth';

type UserType = 'customer' | 'barber' | null;

interface User extends Partial<UserProfile> {
    id: string;
    name: string;
    email: string;
    type: UserType;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    signIn: (email: string, pass: string) => Promise<void>;
    signUp: (role: UserType, data: any) => Promise<void>;
    signOut: () => Promise<void>;
    userType: UserType;
    setUserType: (type: UserType) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userType, setUserType] = useState<UserType>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChange(async (firebaseUser: FirebaseUser | null) => {
            try {
                if (firebaseUser) {
                    const userProfile = await getUserProfile(firebaseUser.uid);
                    if (userProfile) {
                        const mappedUser: User = {
                            id: firebaseUser.uid,
                            name: userProfile.displayName || firebaseUser.email?.split('@')[0] || 'User',
                            email: firebaseUser.email || '',
                            type: (userProfile.role as UserType) || userType || 'customer',
                            avatar: userProfile.photoURL,
                            ...userProfile
                        };
                        setUser(mappedUser);
                        if (userProfile.role) {
                            setUserType(userProfile.role as UserType);
                        }
                    }
                } else {
                    setUser(null);
                    setUserType(null);
                }
            } catch (error) {
                console.error('Auth state change error:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
    }, [userType]);

    const signIn = async (email: string, pass: string) => {
        setIsLoading(true);
        try {
            const credential = await firebaseSignIn(email, pass);
            const userProfile = await getUserProfile(credential.user.uid);

            const type = (userProfile?.role as UserType) || userType || 'customer';
            const mappedUser: User = {
                id: credential.user.uid,
                name: userProfile?.displayName || email.split('@')[0],
                email: email,
                type: type,
                avatar: userProfile?.photoURL,
                ...userProfile
            };
            setUser(mappedUser);
            setUserType(type);
            router.replace(type === 'customer' ? '/(tabs)/home' : '/(barber)/dashboard');
        } catch (error) {
            console.error('Sign in error:', error);
            alert(error instanceof Error ? error.message : 'Sign in failed. Check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const signUp = async (type: UserType, data: any) => {
        setIsLoading(true);
        try {
            const { fullName, email, password, ...rest } = data;
            const credential = await firebaseSignUp(email, password, fullName, type as any, rest);

            const mappedUser: User = {
                id: credential.user.uid,
                name: fullName || credential.user.email?.split('@')[0] || 'New User',
                email: credential.user.email || '',
                type: type,
                ...rest
            };
            setUser(mappedUser);
            setUserType(type);
            router.replace(type === 'customer' ? '/(tabs)/home' : '/(barber)/dashboard');
        } catch (error) {
            console.error('Sign up error:', error);
            alert(error instanceof Error ? error.message : 'Sign up failed. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        setIsLoading(true);
        try {
            await firebaseLogout();
            setUser(null);
            setUserType(null);
            router.replace('/onboarding/welcome');
        } catch (error) {
            console.error('Sign out error:', error);
            alert(error instanceof Error ? error.message : 'Sign out failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                signIn,
                signUp,
                signOut,
                userType,
                setUserType,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

