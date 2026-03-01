import { collection, addDoc, query, where, orderBy, getDocs, limit, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Review } from '../types/firestore.types';

const reviewsColl = collection(db, 'reviews');

export const reviewService = {
    createReview: async (data: Omit<Review, 'id' | 'createdAt'>) => {
        const docRef = await addDoc(reviewsColl, {
            ...data,
            createdAt: new Date().toISOString(),
        });
        await reviewService.updateShopRating(data.shopId);
        return docRef.id;
    },

    getShopReviews: async (shopId: string, lim?: number) => {
        let q = query(reviewsColl, where('shopId', '==', shopId), orderBy('createdAt', 'desc'));
        if (lim) q = query(q, limit(lim));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
    },

    getBarberReviews: async (barberId: string, lim?: number) => {
        let q = query(reviewsColl, where('barberId', '==', barberId), orderBy('createdAt', 'desc'));
        if (lim) q = query(q, limit(lim));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
    },

    hasCustomerReviewed: async (bookingId: string) => {
        const q = query(reviewsColl, where('bookingId', '==', bookingId));
        const snap = await getDocs(q);
        return !snap.empty;
    },

    updateShopRating: async (shopId: string) => {
        const q = query(reviewsColl, where('shopId', '==', shopId));
        const snap = await getDocs(q);
        const count = snap.size;

        if (count > 0) {
            const sum = snap.docs.reduce((acc, d) => acc + d.data().rating, 0);
            const average = sum / count;
            await updateDoc(doc(db, 'shops', shopId), { rating: average, reviewCount: count });
        }
    }
};
