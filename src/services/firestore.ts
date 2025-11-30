import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { QueueItem, Service, Shop, User } from '../types';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  SHOPS: 'shops',
  SERVICES: 'services',
  QUEUE: 'queue',
  BOOKINGS: 'bookings',
  NOTIFICATIONS: 'notifications',
};

// User operations
export const userService = {
  async create(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<void> {
    const userRef = doc(db, COLLECTIONS.USERS, user.id);
    await setDoc(userRef, {
      ...user,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async get(id: string): Promise<User | null> {
    const userRef = doc(db, COLLECTIONS.USERS, id);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        ...data,
        id: userSnap.id,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as User;
    }
    return null;
  },

  async update(id: string, updates: Partial<User>): Promise<void> {
    const userRef = doc(db, COLLECTIONS.USERS, id);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },
};

// Shop operations
export const shopService = {
  async create(shop: Omit<Shop, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const shopRef = doc(collection(db, COLLECTIONS.SHOPS));
    await setDoc(shopRef, {
      ...shop,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return shopRef.id;
  },

  async get(id: string): Promise<Shop | null> {
    const shopRef = doc(db, COLLECTIONS.SHOPS, id);
    const shopSnap = await getDoc(shopRef);
    
    if (shopSnap.exists()) {
      const data = shopSnap.data();
      return {
        ...data,
        id: shopSnap.id,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Shop;
    }
    return null;
  },

  async getByBarberId(barberId: string): Promise<Shop | null> {
    const q = query(
      collection(db, COLLECTIONS.SHOPS),
      where('barberId', '==', barberId),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Shop;
    }
    return null;
  },

  async getNearby(lat: number, lng: number, radiusKm: number = 25): Promise<Shop[]> {
    // Note: This is a simplified approach. For production, consider using GeoFirestore
    // for efficient geospatial queries
    const shopsRef = collection(db, COLLECTIONS.SHOPS);
    const querySnapshot = await getDocs(shopsRef);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Shop;
    });
  },

  async update(id: string, updates: Partial<Shop>): Promise<void> {
    const shopRef = doc(db, COLLECTIONS.SHOPS, id);
    await updateDoc(shopRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  onShopUpdate(shopId: string, callback: (shop: Shop | null) => void) {
    const shopRef = doc(db, COLLECTIONS.SHOPS, shopId);
    return onSnapshot(shopRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Shop);
      } else {
        callback(null);
      }
    });
  },
};

// Service operations
export const serviceService = {
  async create(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const serviceRef = doc(collection(db, COLLECTIONS.SERVICES));
    await setDoc(serviceRef, {
      ...service,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return serviceRef.id;
  },

  async getByShopId(shopId: string): Promise<Service[]> {
    const q = query(
      collection(db, COLLECTIONS.SERVICES),
      where('shopId', '==', shopId),
      where('isActive', '==', true),
      orderBy('title')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Service;
    });
  },

  async update(id: string, updates: Partial<Service>): Promise<void> {
    const serviceRef = doc(db, COLLECTIONS.SERVICES, id);
    await updateDoc(serviceRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(id: string): Promise<void> {
    await this.update(id, { isActive: false });
  },
};

// Queue operations
export const queueService = {
  async joinQueue(queueItem: Omit<QueueItem, 'id' | 'positionIndex' | 'estimatedWaitMinutes' | 'createdAt'>): Promise<string> {
    return await runTransaction(db, async (transaction) => {
      // Get current queue for the shop
      const queueQuery = query(
        collection(db, COLLECTIONS.QUEUE),
        where('shopId', '==', queueItem.shopId),
        where('status', 'in', ['waiting', 'active']),
        orderBy('createdAt')
      );
      
      const queueSnapshot = await getDocs(queueQuery);
      const currentQueue = queueSnapshot.docs.map(doc => doc.data());
      
      // Calculate position and estimated wait
      const positionIndex = currentQueue.length;
      const estimatedWaitMinutes = currentQueue.reduce((total, item) => {
        return total + (item.serviceDuration || 30);
      }, 0);
      
      // Create new queue item
      const queueRef = doc(collection(db, COLLECTIONS.QUEUE));
      transaction.set(queueRef, {
        ...queueItem,
        positionIndex,
        estimatedWaitMinutes,
        createdAt: serverTimestamp(),
      });
      
      return queueRef.id;
    });
  },

  async leaveQueue(queueItemId: string): Promise<void> {
    const queueRef = doc(db, COLLECTIONS.QUEUE, queueItemId);
    await updateDoc(queueRef, {
      status: 'cancelled',
      cancelledAt: serverTimestamp(),
    });
  },

  async completeService(queueItemId: string): Promise<void> {
    await runTransaction(db, async (transaction) => {
      const queueRef = doc(db, COLLECTIONS.QUEUE, queueItemId);
      const queueSnap = await transaction.get(queueRef);
      
      if (!queueSnap.exists()) {
        throw new Error('Queue item not found');
      }
      
      const queueData = queueSnap.data();
      
      // Mark current customer as done
      transaction.update(queueRef, {
        status: 'done',
        completedAt: serverTimestamp(),
      });
      
      // Find next waiting customer and make them active
      const nextQuery = query(
        collection(db, COLLECTIONS.QUEUE),
        where('shopId', '==', queueData.shopId),
        where('status', '==', 'waiting'),
        orderBy('createdAt'),
        limit(1)
      );
      
      const nextSnapshot = await getDocs(nextQuery);
      if (!nextSnapshot.empty) {
        const nextCustomerRef = nextSnapshot.docs[0].ref;
        transaction.update(nextCustomerRef, {
          status: 'active',
          startedAt: serverTimestamp(),
        });
      }
    });
  },

  onQueueUpdate(shopId: string, callback: (queue: QueueItem[]) => void) {
    const q = query(
      collection(db, COLLECTIONS.QUEUE),
      where('shopId', '==', shopId),
      where('status', 'in', ['waiting', 'active']),
      orderBy('createdAt')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const queue = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate(),
          startedAt: data.startedAt?.toDate(),
          completedAt: data.completedAt?.toDate(),
          cancelledAt: data.cancelledAt?.toDate(),
        } as QueueItem;
      });
      callback(queue);
    });
  },
};