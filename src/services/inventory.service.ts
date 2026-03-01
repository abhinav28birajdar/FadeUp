import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { InventoryItem } from '../types/firestore.types';

export const inventoryService = {
    subscribeToInventory: (shopId: string, callback: (items: InventoryItem[]) => void) => {
        const q = query(collection(db, 'inventory'), where('shopId', '==', shopId));
        return onSnapshot(q, snap => {
            callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as InventoryItem)));
        });
    },

    addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        return addDoc(collection(db, 'inventory'), {
            ...item,
            createdAt: now,
            updatedAt: now,
        });
    },

    updateInventoryItem: (id: string, data: Partial<InventoryItem>) => {
        return updateDoc(doc(db, 'inventory', id), {
            ...data,
            updatedAt: new Date().toISOString()
        });
    },

    deleteInventoryItem: (id: string) => {
        return deleteDoc(doc(db, 'inventory', id));
    },

    getLowStockItems: async (shopId: string) => {
        const q = query(collection(db, 'inventory'), where('shopId', '==', shopId));
        const snap = await getDocs(q);
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as InventoryItem));
        return items.filter(i => i.quantity <= i.lowStockThreshold);
    }
};
