import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  id: string; // Firebase Auth UID
  email: string;
  role: "customer" | "shopkeeper";
  shop_id?: string; // Document ID from shops collection (for shopkeepers)
  first_name: string;
  last_name: string;
  avatar_url?: string;
  expo_push_token?: string;
  created_at: Timestamp;
}

export interface Shop {
  id: string; // Document ID
  name: string;
  address: string;
  description: string;
  owner_id: string; // Firebase Auth UID of owner
  average_rating?: number;
  image_url?: string;
  created_at: Timestamp;
}

export interface Service {
  id: string; // Document ID
  shop_id: string; // ID of parent shop document
  name: string;
  price: number;
  duration: number; // in minutes
  description?: string;
  created_at: Timestamp;
}

export interface Booking {
  id: string; // Document ID
  customer_id: string; // Firebase Auth UID
  shop_id: string; // ID of booked shop
  service_ids: string[]; // Array of Service Document IDs
  booking_date: string; // YYYY-MM-DD format
  slot_time: string; // HH:MM format
  total_price: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  feedback_comment?: string;
  created_at: Timestamp;
}

export interface QueueEntry {
  id: string; // Document ID
  booking_id: string; // ID of associated booking
  customer_id: string; // Firebase Auth UID
  shop_id: string; // ID of shop's queue
  position: number;
  status: "waiting" | "completed" | "skipped";
  estimated_completion_time?: Timestamp;
  created_at: Timestamp;
}

export interface Feedback {
  id: string; // Document ID
  booking_id: string; // ID of associated booking
  customer_id: string; // Firebase Auth UID
  shop_id: string; // ID of target shop
  rating: number;
  comment?: string;
  submitted_at: Timestamp;
  created_at: Timestamp;
}