import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    sendEmailVerification,
    updateProfile,
    reauthenticateWithCredential,
    EmailAuthProvider,
    deleteUser,
    updatePassword,
} from 'firebase/auth';
import { auth } from '../config/firebase';

export const authService = {
    login: (email: string, password: string) =>
        signInWithEmailAndPassword(auth, email, password),

    register: (email: string, password: string) =>
        createUserWithEmailAndPassword(auth, email, password),

    logout: () => signOut(auth),

    resetPassword: (email: string) => sendPasswordResetEmail(auth, email),

    sendVerificationEmail: () => {
        const user = auth.currentUser;
        if (!user) return Promise.reject(new Error('No user logged in'));
        return sendEmailVerification(user);
    },

    updateUserProfile: (data: { displayName?: string; photoURL?: string }) => {
        const user = auth.currentUser;
        if (!user) return Promise.reject(new Error('No user logged in'));
        return updateProfile(user, data);
    },

    reAuthenticate: async (password: string) => {
        const user = auth.currentUser;
        if (!user?.email) throw new Error('No user logged in');
        const credential = EmailAuthProvider.credential(user.email, password);
        return reauthenticateWithCredential(user, credential);
    },

    deleteAccount: async () => {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');
        return deleteUser(user);
    },

    changePassword: (newPassword: string) => {
        const user = auth.currentUser;
        if (!user) return Promise.reject(new Error('No user logged in'));
        return updatePassword(user, newPassword);
    },
};
