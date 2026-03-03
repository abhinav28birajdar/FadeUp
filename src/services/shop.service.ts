import { collection, doc, getDoc, getDocs, setDoc, updateDoc, onSnapshot, query, where, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Shop, ShopCategory, Barber, Service, OpeningHours } from '../types/firestore.types';

const shopsColl = collection(db, 'shops');

export const shopService = {
    getApprovedShops: async () => {
        const snap = await getDocs(shopsColl);
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
        const q = query(shopsColl, where('name', '>=', searchQuery), where('name', '<=', searchQuery + '\uf8ff'));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shop));
    },

    getShopsByCategory: async (category: ShopCategory) => {
        const q = query(shopsColl, where('category', 'array-contains', category));
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
        const q = query(shopsColl, where('city', '==', city));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shop));
    },

    addService: async (service: Omit<Service, 'id'>) => {
        const docRef = await addDoc(collection(db, 'services'), service);
        return docRef.id;
    },

    updateService: (id: string, data: Partial<Service>) => {
        return updateDoc(doc(db, 'services', id), data);
    },

    toggleService: (id: string, isActive: boolean) => {
        return updateDoc(doc(db, 'services', id), { isActive });
    },

    updateOpeningHours: (shopId: string, hours: OpeningHours) => {
        return updateDoc(doc(db, 'shops', shopId), {
            openingHours: hours,
            updatedAt: new Date().toISOString()
        });
    },

    deleteShop: (id: string) => {
        return deleteDoc(doc(db, 'shops', id));
    },
};
