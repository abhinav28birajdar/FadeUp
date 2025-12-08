// Enhanced Firestore services
import { collection, doc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Booking, Notification, QueueItem, Shop } from '../types';

// Enhanced Queue Service
export class EnhancedQueueService {
  static subscribeToQueue(shopId: string, callback: (items: QueueItem[]) => void) {
    const q = query(
      collection(db, 'queue'),
      where('shopId', '==', shopId),
      orderBy('createdAt', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QueueItem[];
      callback(items);
    });
  }

  static subscribeToUserQueue(userId: string, callback: (items: QueueItem[]) => void) {
    const q = query(
      collection(db, 'queue'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QueueItem[];
      callback(items);
    });
  }

  static async joinQueue(shopId: string, userId: string, serviceId: string): Promise<QueueItem> {
    // Mock implementation
    const queueItem: QueueItem = {
      id: `queue_${Date.now()}`,
      userId: userId,
      shopId,
      serviceId,
      status: 'waiting',
      positionIndex: 1,
      estimatedWaitMinutes: 30,
      customerName: 'Test User',
      serviceName: 'Haircut',
      serviceDuration: 30,
      createdAt: new Date(),
    };
    return queueItem;
  }

  static async leaveQueue(queueItemId: string): Promise<void> {
    // Mock implementation
    console.log('Leaving queue:', queueItemId);
  }

  static async completeService(queueItemId: string): Promise<void> {
    // Mock implementation
    console.log('Completing service:', queueItemId);
  }
}

// Enhanced Booking Service
export class EnhancedBookingService {
  static subscribeToBookings(shopId: string, callback: (bookings: Booking[]) => void) {
    const q = query(
      collection(db, 'bookings'),
      where('shopId', '==', shopId),
      orderBy('scheduledTime', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
      callback(bookings);
    });
  }

  static subscribeToUserBookings(userId: string, callback: (bookings: Booking[]) => void) {
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', userId),
      orderBy('scheduledTime', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
      callback(bookings);
    });
  }

  static async createBooking(bookingData: any): Promise<string> {
    // Mock implementation
    const bookingId = `booking_${Date.now()}`;
    console.log('Creating booking:', bookingData);
    return bookingId;
  }

  static async updateBookingStatus(bookingId: string, status: string): Promise<void> {
    // Mock implementation
    console.log('Updating booking status:', bookingId, status);
  }

  static async getBookingsByUser(userId: string): Promise<Booking[]> {
    // Mock implementation
    console.log('Getting bookings for user:', userId);
    return [];
  }

  static async getBookingsByShop(shopId: string): Promise<Booking[]> {
    // Mock implementation
    console.log('Getting bookings for shop:', shopId);
    return [];
  }
}

// Enhanced Shop Service
export class EnhancedShopService {
  static subscribeToShop(shopId: string, callback: (shop: Shop | null) => void) {
    const shopRef = doc(db, 'shops', shopId);
    
    return onSnapshot(shopRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as Shop);
      } else {
        callback(null);
      }
    });
  }

  static subscribeToShops(callback: (shops: Shop[]) => void) {
    const q = query(
      collection(db, 'shops'),
      orderBy('name', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const shops = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Shop[];
      callback(shops);
    });
  }

  static async addRating(shopId: string, rating: number): Promise<void> {
    // Mock implementation
    console.log('Adding rating to shop:', shopId, rating);
  }
}

// Enhanced Notification Service
export class EnhancedNotificationService {
  static subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      callback(notifications);
    });
  }

  static async markAsRead(notificationId: string): Promise<void> {
    // Mock implementation
    console.log('Marking notification as read:', notificationId);
  }

  static async markAllAsRead(userId: string): Promise<void> {
    // Mock implementation
    console.log('Marking all notifications as read for user:', userId);
  }

  static async getUserNotifications(userId: string): Promise<Notification[]> {
    // Mock implementation
    console.log('Getting notifications for user:', userId);
    return [];
  }
}

// Export individual services
export const enhancedQueueService = EnhancedQueueService;
export const bookingService = EnhancedBookingService;
export const enhancedShopService = EnhancedShopService;
export const notificationService = EnhancedNotificationService;