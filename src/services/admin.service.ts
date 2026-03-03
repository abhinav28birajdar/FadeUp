import {
    collection, doc, query, where, getDocs, updateDoc, deleteDoc,
    orderBy, limit, getCountFromServer, DocumentSnapshot, startAfter,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserProfile, Shop } from '../types/firestore.types';

export const adminService = {
    getAllUsers: async (pageSize: number, lastDoc?: DocumentSnapshot) => {
        let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(pageSize));
        if (lastDoc) {
            q = query(
                collection(db, 'users'),
                orderBy('createdAt', 'desc'),
                startAfter(lastDoc),
                limit(pageSize)
            );
        }
        const snap = await getDocs(q);
        return {
            users: snap.docs.map((d) => ({ ...d.data(), uid: d.id } as UserProfile)),
            lastDoc: snap.docs[snap.docs.length - 1] ?? null,
        };
    },

    searchUsers: async (searchQuery: string) => {
        const q = query(
            collection(db, 'users'),
            where('displayName', '>=', searchQuery),
            where('displayName', '<=', searchQuery + '\uf8ff')
        );
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ ...d.data(), uid: d.id } as UserProfile));
    },

    getPendingShops: async () => {
        const q = query(collection(db, 'shops'), where('isApproved', '==', false));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Shop));
    },

    approveShop: (shopId: string) => {
        return updateDoc(doc(db, 'shops', shopId), { isApproved: true });
    },

    rejectShop: (shopId: string) => {
        return deleteDoc(doc(db, 'shops', shopId));
    },

    getPlatformStats: async () => {
        try {
            const [usersCount, shopsCount, pendingCount] = await Promise.all([
                getCountFromServer(collection(db, 'users')),
                getCountFromServer(query(collection(db, 'shops'), where('isApproved', '==', true))),
                getCountFromServer(query(collection(db, 'shops'), where('isApproved', '==', false))),
            ]);
            return {
                totalUsers: usersCount.data().count,
                totalShops: shopsCount.data().count,
                pendingApprovals: pendingCount.data().count,
            };
        } catch {
            return { totalUsers: 0, totalShops: 0, pendingApprovals: 0 };
        }
    },

    getTopShops: async (lim: number = 10) => {
        const q = query(
            collection(db, 'shops'),
            where('isApproved', '==', true),
            orderBy('rating', 'desc'),
            limit(lim)
        );
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Shop));
    },

    updateUserRole: (uid: string, role: string) => {
        return updateDoc(doc(db, 'users', uid), { role });
    },

    deleteUser: (uid: string) => {
        return deleteDoc(doc(db, 'users', uid));
    },
};
