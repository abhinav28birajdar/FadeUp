import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';

export const authService = {
    login: (email: string, password: string) =>
        signInWithEmailAndPassword(auth, email, password),
    register: (email: string, password: string) =>
        createUserWithEmailAndPassword(auth, email, password),
    logout: () => signOut(auth),
    resetPassword: (email: string) => sendPasswordResetEmail(auth, email),
    updateUserProfile: (data: { displayName?: string; photoURL?: string }) =>
        updateProfile(auth.currentUser!, data),
};
