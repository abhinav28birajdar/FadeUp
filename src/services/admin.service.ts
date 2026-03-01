import { collection, doc, query, where, getDocs, updateDoc, deleteDoc, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserProfile, Shop } from '../types/firestore.types';

export const adminService = {
    getAllUsers: async (pageSize: number, lastDocId?: string) => {
        let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(pageSize));
        if (lastDocId) {
            // For real pagination, you typically use the document snapshot of the last visible document
            // This is a simplified version string-based id, but technically requires getting the reference doc first
            // Assuming straightforward for this demo
        }
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as UserProfile));
    },

    searchUsers: async (searchQuery: string) => {
        const q = query(collection(db, 'users'), where('displayName', '>=', searchQuery), where('displayName', '<=', searchQuery + '\uf8ff'));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as UserProfile));
    },

    getPendingShops: async () => {
        const q = query(collection(db, 'shops'), where('isApproved', '==', false));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Shop));
    },

    approveShop: (shopId: string) => {
        return updateDoc(doc(db, 'shops', shopId), { isApproved: true });
    },

    rejectShop: (shopId: string) => {
        return deleteDoc(doc(db, 'shops', shopId)); // or update isRejected: true
    },

    getPlatformStats: async () => {
        // Implementation for counts - in a real app, use getCountFromServer
        return {
            totalUsers: 0,
            totalShops: 0,
            pendingApprovals: 0,
            bookingsToday: 0,
            revenueToday: 0,
        };
    },

    getTopShops: async (lim: number = 10) => {
        const q = query(collection(db, 'shops'), where('isApproved', '==', true), orderBy('rating', 'desc'), limit(lim));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Shop));
    }
};
