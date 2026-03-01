export type UserRole = 'customer' | 'barber' | 'shop_owner' | 'admin';

export interface UserProfile {
    uid: string;
    email: string;
    phone: string;
    displayName: string;
    photoURL: string | null;
    role: UserRole;
    fcmToken?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Shop {
    id: string;
    ownerId: string;
    name: string;
    description: string;
    address: string;
    city: string;
    photoURL: string | null;
    coverPhotoURL: string | null;
    phone: string;
    category: ShopCategory[];
    rating: number;
    reviewCount: number;
    isOpen: boolean;
    isApproved: boolean;
    openingHours: OpeningHours;
    location: { lat: number; lng: number };
    createdAt: string;
    updatedAt: string;
}

export type ShopCategory = 'haircut' | 'beard' | 'coloring' | 'facial' | 'kids';

export interface OpeningHours {
    [day: string]: { open: string; close: string; isClosed: boolean };
}

export interface Service {
    id: string;
    shopId: string;
    name: string;
    description: string;
    price: number;
    durationMinutes: number;
    category: ShopCategory;
    isActive: boolean;
}

export interface Barber {
    id: string;
    shopId: string;
    userId: string;
    name: string;
    photoURL: string | null;
    specialties: string[];
    rating: number;
    reviewCount: number;
    isAvailable: boolean;
}

export type BookingStatus =
    | 'pending'
    | 'confirmed'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'no_show';

export interface Booking {
    id: string;
    customerId: string;
    shopId: string;
    barberId: string;
    serviceId: string;
    customerName: string;
    customerPhone: string;
    shopName: string;
    barberName: string;
    serviceName: string;
    servicePrice: number;
    serviceDuration: number;
    scheduledAt: string;
    status: BookingStatus;
    queuePosition: number | null;
    notes: string;
    createdAt: string;
    updatedAt: string;
}

export interface QueueEntry {
    id: string;
    shopId: string;
    barberId: string;
    bookingId: string;
    customerId: string;
    customerName: string;
    customerPhotoURL: string | null;
    serviceName: string;
    position: number;
    estimatedWaitMinutes: number;
    status: 'waiting' | 'in_progress' | 'completed';
    arrivedAt: string;
}

export interface Review {
    id: string;
    bookingId: string;
    shopId: string;
    barberId: string;
    customerId: string;
    customerName: string;
    customerPhotoURL: string | null;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface ChatRoom {
    id: string;
    participantIds: string[];
    participantNames: { [uid: string]: string };
    participantPhotos: { [uid: string]: string | null };
    shopId: string;
    lastMessage: string;
    lastMessageAt: string;
    lastSenderId: string;
    unreadCount: { [uid: string]: number };
}

export interface ChatMessage {
    id: string;
    roomId: string;
    senderId: string;
    senderName: string;
    text: string;
    imageURL: string | null;
    readBy: string[];
    createdAt: string;
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    body: string;
    type: 'booking_confirmed' | 'booking_reminder' | 'queue_update' | 'promotion' | 'system';
    data: Record<string, string>;
    isRead: boolean;
    createdAt: string;
}

export interface Earning {
    id: string;
    shopId: string;
    barberId: string;
    bookingId: string;
    amount: number;
    date: string;
    serviceName: string;
    customerName: string;
}

export interface InventoryItem {
    id: string;
    shopId: string;
    name: string;
    quantity: number;
    unit: string;
    lowStockThreshold: number;
    costPerUnit: number;
    createdAt: string;
    updatedAt: string;
}
