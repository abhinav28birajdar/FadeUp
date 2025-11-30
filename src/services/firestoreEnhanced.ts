import {
    arrayUnion,
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
    where,
    writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
    Booking,
    BookingStatus,
    FirestoreQueueItem,
    FirestoreShop,
    FirestoreUser,
    Notification,
    QueueItem,
    QueueStatus,
    Service,
    Shop,
    User
} from '../types';

// Enhanced User Service
export const enhancedUserService = {
  async createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<void> {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, {
      ...user,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async getUser(id: string): Promise<User | null> {
    const userRef = doc(db, 'users', id);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data() as FirestoreUser;
      return {
        ...data,
        id: userSnap.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as User;
    }
    return null;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const userRef = doc(db, 'users', id);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  // Add push notification token for user
  async updatePushToken(userId: string, token: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      pushTokens: arrayUnion(token),
      updatedAt: serverTimestamp(),
    });
  },
};

// Enhanced Shop Service with reviews and ratings
export const enhancedShopService = {
  async createShop(shop: Omit<Shop, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'totalRatings'>): Promise<string> {
    const shopRef = doc(collection(db, 'shops'));
    await setDoc(shopRef, {
      ...shop,
      rating: 0,
      totalRatings: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return shopRef.id;
  },

  async getShop(id: string): Promise<Shop | null> {
    const shopRef = doc(db, 'shops', id);
    const shopSnap = await getDoc(shopRef);
    
    if (shopSnap.exists()) {
      const data = shopSnap.data() as FirestoreShop;
      return {
        ...data,
        id: shopSnap.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Shop;
    }
    return null;
  },

  async getShopsByBarber(barberId: string): Promise<Shop[]> {
    const q = query(
      collection(db, 'shops'),
      where('barberId', '==', barberId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as FirestoreShop;
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Shop;
    });
  },

  async getNearbyShops(lat: number, lng: number, radiusKm: number = 25): Promise<Shop[]> {
    // Simple approach - in production, use GeoFirestore for efficient geo queries
    const shopsRef = collection(db, 'shops');
    const querySnapshot = await getDocs(shopsRef);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as FirestoreShop;
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Shop;
    });
  },

  async updateShop(id: string, updates: Partial<Shop>): Promise<void> {
    const shopRef = doc(db, 'shops', id);
    await updateDoc(shopRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  // Add rating to shop
  async addRating(shopId: string, rating: number): Promise<void> {
    return runTransaction(db, async (transaction) => {
      const shopRef = doc(db, 'shops', shopId);
      const shopDoc = await transaction.get(shopRef);
      
      if (!shopDoc.exists()) {
        throw new Error('Shop not found');
      }
      
      const shopData = shopDoc.data();
      const currentRating = shopData.rating || 0;
      const totalRatings = shopData.totalRatings || 0;
      
      const newTotalRatings = totalRatings + 1;
      const newRating = ((currentRating * totalRatings) + rating) / newTotalRatings;
      
      transaction.update(shopRef, {
        rating: Math.round(newRating * 10) / 10, // Round to 1 decimal place
        totalRatings: newTotalRatings,
        updatedAt: serverTimestamp(),
      });
    });
  },

  subscribeToShop(shopId: string, callback: (shop: Shop | null) => void) {
    const shopRef = doc(db, 'shops', shopId);
    return onSnapshot(shopRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as FirestoreShop;
        callback({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Shop);
      } else {
        callback(null);
      }
    });
  },
};

// Enhanced Service Management
export const enhancedServiceService = {
  async createService(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const serviceRef = doc(collection(db, 'services'));
    await setDoc(serviceRef, {
      ...service,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return serviceRef.id;
  },

  async getService(id: string): Promise<Service | null> {
    const serviceRef = doc(db, 'services', id);
    const serviceSnap = await getDoc(serviceRef);
    
    if (serviceSnap.exists()) {
      const data = serviceSnap.data();
      return {
        ...data,
        id: serviceSnap.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Service;
    }
    return null;
  },

  async getServicesByShop(shopId: string): Promise<Service[]> {
    const q = query(
      collection(db, 'services'),
      where('shopId', '==', shopId),
      where('isActive', '==', true),
      orderBy('price')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Service;
    });
  },

  async updateService(id: string, updates: Partial<Service>): Promise<void> {
    const serviceRef = doc(db, 'services', id);
    await updateDoc(serviceRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteService(id: string): Promise<void> {
    await this.updateService(id, { isActive: false });
  },
};

// Enhanced Queue Service with atomic operations
export const enhancedQueueService = {
  // Join queue with atomic transaction
  async joinQueue(shopId: string, userId: string, serviceId: string): Promise<QueueItem> {
    return runTransaction(db, async (transaction) => {
      // Get user and service info
      const [user, service] = await Promise.all([
        enhancedUserService.getUser(userId),
        enhancedServiceService.getService(serviceId)
      ]);

      if (!user || !service) {
        throw new Error('User or service not found');
      }

      // Check if user is already in queue for this shop
      const existingQueueQuery = query(
        collection(db, 'queue'),
        where('shopId', '==', shopId),
        where('userId', '==', userId),
        where('status', 'in', ['waiting', 'active'])
      );
      const existingSnapshot = await getDocs(existingQueueQuery);
      
      if (!existingSnapshot.empty) {
        throw new Error('User is already in queue for this shop');
      }

      // Get current queue to determine position
      const queueQuery = query(
        collection(db, 'queue'),
        where('shopId', '==', shopId),
        where('status', 'in', ['waiting', 'active']),
        orderBy('positionIndex', 'desc'),
        limit(1)
      );
      const queueSnapshot = await getDocs(queueQuery);

      const nextPosition = queueSnapshot.empty ? 0 : queueSnapshot.docs[0].data().positionIndex + 1;
      const estimatedWait = nextPosition * service.durationMinutes;

      const queueData = {
        shopId,
        userId,
        serviceId,
        status: 'waiting' as QueueStatus,
        positionIndex: nextPosition,
        estimatedWaitMinutes: estimatedWait,
        customerName: user.name,
        customerPhone: user.phone,
        serviceName: service.title,
        serviceDuration: service.durationMinutes,
        createdAt: serverTimestamp(),
      };

      const docRef = doc(collection(db, 'queue'));
      transaction.set(docRef, queueData);
      
      return {
        id: docRef.id,
        ...queueData,
        createdAt: new Date(),
      } as QueueItem;
    });
  },

  // Complete service with queue reordering
  async completeService(queueItemId: string): Promise<void> {
    return runTransaction(db, async (transaction) => {
      // Get the queue item being completed
      const queueRef = doc(db, 'queue', queueItemId);
      const queueDoc = await transaction.get(queueRef);
      
      if (!queueDoc.exists()) {
        throw new Error('Queue item not found');
      }
      
      const queueData = queueDoc.data();
      const completedPosition = queueData.positionIndex;
      const shopId = queueData.shopId;
      
      // Mark as completed
      transaction.update(queueRef, {
        status: 'done',
        completedAt: serverTimestamp(),
      });
      
      // Get all waiting customers with higher position indices
      const waitingQuery = query(
        collection(db, 'queue'),
        where('shopId', '==', shopId),
        where('status', '==', 'waiting'),
        where('positionIndex', '>', completedPosition)
      );
      
      const waitingSnapshot = await getDocs(waitingQuery);
      
      // Update position indices for remaining customers
      waitingSnapshot.docs.forEach(waitingDoc => {
        const waitingRef = doc(db, 'queue', waitingDoc.id);
        const waitingData = waitingDoc.data();
        transaction.update(waitingRef, {
          positionIndex: waitingData.positionIndex - 1,
          estimatedWaitMinutes: (waitingData.positionIndex - 1) * waitingData.serviceDuration,
        });
      });
      
      // If there's a next customer, mark them as active
      const nextCustomerQuery = query(
        collection(db, 'queue'),
        where('shopId', '==', shopId),
        where('status', '==', 'waiting'),
        where('positionIndex', '==', 0),
        limit(1)
      );
      
      const nextCustomerSnapshot = await getDocs(nextCustomerQuery);
      if (!nextCustomerSnapshot.empty) {
        const nextCustomerRef = doc(db, 'queue', nextCustomerSnapshot.docs[0].id);
        transaction.update(nextCustomerRef, {
          status: 'active',
          startedAt: serverTimestamp(),
        });
      }
    });
  },

  // Leave queue with position reordering
  async leaveQueue(queueItemId: string): Promise<void> {
    return runTransaction(db, async (transaction) => {
      // Get the queue item being cancelled
      const queueRef = doc(db, 'queue', queueItemId);
      const queueDoc = await transaction.get(queueRef);
      
      if (!queueDoc.exists()) {
        throw new Error('Queue item not found');
      }
      
      const queueData = queueDoc.data();
      const cancelledPosition = queueData.positionIndex;
      const shopId = queueData.shopId;
      
      // Mark as cancelled
      transaction.update(queueRef, {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
      });
      
      // Get all waiting customers with higher position indices
      const waitingQuery = query(
        collection(db, 'queue'),
        where('shopId', '==', shopId),
        where('status', 'in', ['waiting', 'active']),
        where('positionIndex', '>', cancelledPosition)
      );
      
      const waitingSnapshot = await getDocs(waitingQuery);
      
      // Update position indices for remaining customers
      waitingSnapshot.docs.forEach(waitingDoc => {
        const waitingRef = doc(db, 'queue', waitingDoc.id);
        const waitingData = waitingDoc.data();
        transaction.update(waitingRef, {
          positionIndex: waitingData.positionIndex - 1,
          estimatedWaitMinutes: Math.max(0, (waitingData.positionIndex - 1) * waitingData.serviceDuration),
        });
      });
    });
  },

  // Subscribe to queue updates
  subscribeToQueue(shopId: string, callback: (queueItems: QueueItem[]) => void) {
    const q = query(
      collection(db, 'queue'),
      where('shopId', '==', shopId),
      where('status', '!=', 'done'),
      orderBy('status', 'desc'), // active first
      orderBy('positionIndex', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const queueItems = snapshot.docs.map(doc => {
        const data = doc.data() as FirestoreQueueItem;
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          startedAt: data.startedAt?.toDate(),
          completedAt: data.completedAt?.toDate(),
          cancelledAt: data.cancelledAt?.toDate(),
        } as QueueItem;
      });
      callback(queueItems);
    });
  },

  // Get user's current queue position
  async getUserQueueStatus(userId: string, shopId: string): Promise<QueueItem | null> {
    const q = query(
      collection(db, 'queue'),
      where('shopId', '==', shopId),
      where('userId', '==', userId),
      where('status', 'in', ['waiting', 'active']),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data() as FirestoreQueueItem;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        startedAt: data.startedAt?.toDate(),
        completedAt: data.completedAt?.toDate(),
        cancelledAt: data.cancelledAt?.toDate(),
      } as QueueItem;
    }
    return null;
  },
};

// Booking Service
export const bookingService = {
  async createBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const bookingRef = doc(collection(db, 'bookings'));
    await setDoc(bookingRef, {
      ...booking,
      status: 'pending' as BookingStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return bookingRef.id;
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  },

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', userId),
      orderBy('scheduledTime', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        scheduledTime: data.scheduledTime?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Booking;
    });
  },

  async getBookingsByShop(shopId: string): Promise<Booking[]> {
    const q = query(
      collection(db, 'bookings'),
      where('shopId', '==', shopId),
      orderBy('scheduledTime', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        scheduledTime: data.scheduledTime?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Booking;
    });
  },
};

// Notification Service
export const notificationService = {
  async createNotification(notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Promise<string> {
    const notificationRef = doc(collection(db, 'notifications'));
    await setDoc(notificationRef, {
      ...notification,
      isRead: false,
      createdAt: serverTimestamp(),
    });
    return notificationRef.id;
  },

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Notification;
    });
  },

  async markAsRead(notificationId: string): Promise<void> {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      isRead: true,
    });
  },

  async markAllAsRead(userId: string): Promise<void> {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    const querySnapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    querySnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { isRead: true });
    });
    
    await batch.commit();
  },

  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('isRead', '==', false),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Notification;
      });
      callback(notifications);
    });
  },
};