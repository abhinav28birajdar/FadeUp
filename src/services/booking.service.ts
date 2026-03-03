import {
    collection, doc, getDoc, getDocs, addDoc, updateDoc,
    onSnapshot, query, where, orderBy, writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Booking, BookingStatus, QueueEntry } from '../types/firestore.types';

const bookingsColl = collection(db, 'bookings');
const queueColl = collection(db, 'queue');

export const bookingService = {
    createBooking: async (data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const docRef = await addDoc(bookingsColl, {
            ...data,
            createdAt: now,
            updatedAt: now,
        });

        const entry: Omit<QueueEntry, 'id'> = {
            shopId: data.shopId,
            barberId: data.barberId,
            bookingId: docRef.id,
            customerId: data.customerId,
            customerName: data.customerName,
            customerPhotoURL: null,
            serviceName: data.serviceName,
            position: data.queuePosition ?? 0,
            estimatedWaitMinutes: data.serviceDuration ?? 0,
            status: 'waiting',
            arrivedAt: now,
        };
        await addDoc(queueColl, entry);
        return docRef.id;
    },

    getCustomerBookings: async (customerId: string) => {
        const q = query(bookingsColl, where('customerId', '==', customerId), orderBy('scheduledAt', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
    },

    getShopBookings: async (shopId: string, date: string) => {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        const q = query(
            bookingsColl,
            where('shopId', '==', shopId),
            where('scheduledAt', '>=', start.toISOString()),
            where('scheduledAt', '<=', end.toISOString())
        );
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
    },

    subscribeToCustomerBookings: (customerId: string, callback: (bookings: Booking[]) => void) => {
        const q = query(bookingsColl, where('customerId', '==', customerId), orderBy('scheduledAt', 'desc'));
        return onSnapshot(q, snap => {
            callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking)));
        });
    },

    updateBookingStatus: (id: string, status: BookingStatus) => {
        return updateDoc(doc(db, 'bookings', id), {
            status,
            updatedAt: new Date().toISOString(),
        });
    },

    subscribeToBooking: (id: string, callback: (b: Booking | null) => void) => {
        return onSnapshot(doc(db, 'bookings', id), (snap) => {
            if (snap.exists()) callback({ id: snap.id, ...snap.data() } as Booking);
            else callback(null);
        });
    },

    cancelBooking: async (id: string) => {
        const batch = writeBatch(db);
        batch.update(doc(db, 'bookings', id), {
            status: 'cancelled' as BookingStatus,
            updatedAt: new Date().toISOString(),
        });

        const qSnap = await getDocs(query(queueColl, where('bookingId', '==', id)));
        qSnap.docs.forEach((d) => {
            batch.update(d.ref, { status: 'cancelled' });
        });

        await batch.commit();
    },

    getBookingById: async (id: string) => {
        const snap = await getDoc(doc(db, 'bookings', id));
        if (snap.exists()) return { id: snap.id, ...snap.data() } as Booking;
        return null;
    },

};
