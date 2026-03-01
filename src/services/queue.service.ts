import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { QueueEntry } from '../types/firestore.types';

const queueColl = collection(db, 'queue');

export const queueService = {
    subscribeToShopQueue: (shopId: string, callback: (queue: QueueEntry[]) => void) => {
        const q = query(queueColl, where('shopId', '==', shopId), where('status', 'in', ['waiting', 'in_progress']), orderBy('position', 'asc'));
        return onSnapshot(q, snap => {
            callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as QueueEntry)));
        });
    },

    subscribeToBarberQueue: (barberId: string, callback: (queue: QueueEntry[]) => void) => {
        const q = query(queueColl, where('barberId', '==', barberId), where('status', 'in', ['waiting', 'in_progress']), orderBy('position', 'asc'));
        return onSnapshot(q, snap => {
            callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as QueueEntry)));
        });
    },

    addToQueue: (entry: Omit<QueueEntry, 'id'>) => {
        return addDoc(queueColl, entry);
    },

    markInProgress: (entryId: string) => {
        return updateDoc(doc(db, 'queue', entryId), { status: 'in_progress' });
    },

    completeQueueEntry: (entryId: string) => {
        return updateDoc(doc(db, 'queue', entryId), { status: 'completed' });
    },

    getCustomerQueuePosition: (bookingId: string, callback: (position: number | null) => void) => {
        const q = query(queueColl, where('bookingId', '==', bookingId));
        return onSnapshot(q, snap => {
            if (!snap.empty) {
                callback(snap.docs[0].data().position);
            } else {
                callback(null);
            }
        });
    },

    removeFromQueue: (entryId: string) => {
        return deleteDoc(doc(db, 'queue', entryId));
    }
};
