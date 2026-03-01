import { collection, addDoc, onSnapshot, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Earning } from '../types/firestore.types';

export const earningsService = {
    subscribeToBarberEarnings: (barberId: string, callback: (earnings: Earning[]) => void) => {
        const q = query(collection(db, 'earnings'), where('barberId', '==', barberId), orderBy('date', 'desc'));
        return onSnapshot(q, snap => {
            callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Earning)));
        });
    },

    getEarningsByDateRange: async (shopId: string, start: string, end: string) => {
        const q = query(
            collection(db, 'earnings'),
            where('shopId', '==', shopId),
            where('date', '>=', start),
            where('date', '<=', end)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Earning));
    },

    createEarningRecord: (data: Omit<Earning, 'id'>) => {
        return addDoc(collection(db, 'earnings'), data);
    }
};
