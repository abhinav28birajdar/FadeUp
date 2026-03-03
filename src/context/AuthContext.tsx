import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../config/firebase';
import { UserProfile, UserRole } from '../types/firestore.types';

interface AuthContextType {
    user: UserProfile | null;
    firebaseUser: FirebaseUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    role: UserRole | null;
    hasSeenOnboarding: boolean | null;
    completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    firebaseUser: null,
    isLoading: true,
    isAuthenticated: false,
    role: null,
    hasSeenOnboarding: null,
    completeOnboarding: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

    useEffect(() => {
        const loadOnboardingState = async () => {
            try {
                const seen = await AsyncStorage.getItem('hasSeenOnboarding');
                setHasSeenOnboarding(seen === 'true');
            } catch (e) {
                setHasSeenOnboarding(false);
            }
        };
        loadOnboardingState();

        let unsubscribeProfile: (() => void) | undefined;

        const unsubscribeAuth = onAuthStateChanged(auth, async (fUser) => {
            setFirebaseUser(fUser);
            if (fUser) {
                // Subscribe to user profile for real-time updates
                const userRef = doc(db, 'users', fUser.uid);
                unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUser(docSnap.data() as UserProfile);
                    } else {
                        setUser(null);
                    }
                    setIsLoading(false);
                }, (error) => {
                    console.error('Profile subscription error:', error);
                    setIsLoading(false);
                });
            } else {
                setUser(null);
                if (unsubscribeProfile) {
                    unsubscribeProfile();
                }
                setIsLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeProfile) {
                unsubscribeProfile();
            }
        };
    }, []);

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem('hasSeenOnboarding', 'true');
            setHasSeenOnboarding(true);
        } catch (e) {
            console.error('Failed to save onboarding state', e);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                firebaseUser,
                isLoading,
                isAuthenticated: !!firebaseUser && !!user,
                role: user?.role || null,
                hasSeenOnboarding,
                completeOnboarding,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => useContext(AuthContext);
