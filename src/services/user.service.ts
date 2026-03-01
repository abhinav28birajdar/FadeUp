import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserProfile } from '../types/firestore.types';

export const userService = {
    createProfile: (uid: string, data: Partial<UserProfile>) => {
        const docRef = doc(db, 'users', uid);
        return setDoc(docRef, {
            ...data,
            uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    },

    getProfile: async (uid: string) => {
        const docSnap = await getDoc(doc(db, 'users', uid));
        if (docSnap.exists()) {
            return docSnap.data() as UserProfile;
        }
        return null;
    },

    updateProfile: (uid: string, data: Partial<UserProfile>) => {
        const docRef = doc(db, 'users', uid);
        return updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
    },

    subscribeToProfile: (uid: string, callback: (data: UserProfile | null) => void) => {
        const docRef = doc(db, 'users', uid);
        return onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                callback(docSnap.data() as UserProfile);
            } else {
                callback(null);
            }
        });
    },

    saveFCMToken: (uid: string, fcmToken: string) => {
        const docRef = doc(db, 'users', uid);
        return updateDoc(docRef, { fcmToken });
    }
};
