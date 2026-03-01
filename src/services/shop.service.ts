import { collection, doc, getDoc, getDocs, setDoc, updateDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Shop, ShopCategory, Barber, Service } from '../types/firestore.types';

const shopsColl = collection(db, 'shops');

export const shopService = {
    getApprovedShops: async () => {
        const q = query(shopsColl, where('isApproved', '==', true));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shop));
    },

    getShopById: async (id: string) => {
        const snap = await getDoc(doc(db, 'shops', id));
        if (snap.exists()) return { id: snap.id, ...snap.data() } as Shop;
        return null;
    },

    subscribeToShop: (id: string, callback: (shop: Shop | null) => void) => {
        return onSnapshot(doc(db, 'shops', id), (snap) => {
            if (snap.exists()) callback({ id: snap.id, ...snap.data() } as Shop);
            else callback(null);
        });
    },

    searchShops: async (searchQuery: string) => {
        // Basic search simulation
        const q = query(shopsColl, where('isApproved', '==', true), where('name', '>=', searchQuery), where('name', '<=', searchQuery + '\uf8ff'));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shop));
    },

    getShopsByCategory: async (category: ShopCategory) => {
        const q = query(shopsColl, where('isApproved', '==', true), where('category', 'array-contains', category));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shop));
    },

    createShop: async (id: string, data: Partial<Shop>) => {
        return setDoc(doc(db, 'shops', id), {
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    },

    updateShop: (id: string, data: Partial<Shop>) => {
        return updateDoc(doc(db, 'shops', id), { ...data, updatedAt: new Date().toISOString() });
    },

    getShopBarbers: async (shopId: string) => {
        const q = query(collection(db, 'barbers'), where('shopId', '==', shopId));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Barber));
    },

    getShopServices: async (shopId: string) => {
        const q = query(collection(db, 'services'), where('shopId', '==', shopId), where('isActive', '==', true));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
    },

    getShopsByCity: async (city: string) => {
        const q = query(shopsColl, where('city', '==', city), where('isApproved', '==', true));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shop));
    },
};
