import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';

type UserType = 'customer' | 'barber' | null;

interface User {
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

// Mock user data
const MOCK_CUSTOMER: User = {
    id: 'cust_123',
    name: 'Abhinav Birajdar',
    email: 'abhinavbirajdar28@gmail.com',
    type: 'customer',
    avatar: 'https://i.pravatar.cc/150?u=abhinav',
};

const MOCK_BARBER: User = {
    id: 'barb_456',
    name: 'Master Barber',
    email: 'barber@fadeup.com',
    type: 'barber',
    avatar: 'https://i.pravatar.cc/150?u=barber',
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userType, setUserType] = useState<UserType>(null);

    useEffect(() => {
        // Simulate checking local storage
        setTimeout(() => setIsLoading(false), 1000);
    }, []);

    const signIn = async (email: string, pass: string) => {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        if (email === 'abhinavbirajdar28@gmail.com' && pass === '12345678') {
            const type = userType || 'customer';
            const loggedInUser = type === 'customer' ? MOCK_CUSTOMER : MOCK_BARBER;
            setUser(loggedInUser);
            router.replace(type === 'customer' ? '/(tabs)/home' : '/(barber)/dashboard');
        } else if (email === 'barber@test.com' && pass === '12345678') {
            setUser(MOCK_BARBER);
            router.replace('/(barber)/dashboard');
        } else {
            alert('Invalid credentials. Use abhinavbirajdar28@gmail.com / 12345678');
        }
        setIsLoading(false);
    };

    const signUp = async (type: UserType, data: any) => {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const newUser: User = {
            id: Math.random().toString(),
            name: data.fullName || 'New User',
            email: data.email,
            type: type,
        };
        setUser(newUser);
        router.replace(type === 'customer' ? '/(tabs)/home' : '/(barber)/dashboard');
        setIsLoading(false);
    };

    const signOut = async () => {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        setUser(null);
        setUserType(null);
        router.replace('/onboarding/welcome');
        setIsLoading(false);
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
