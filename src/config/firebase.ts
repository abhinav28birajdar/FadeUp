// Firebase configuration
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Placeholder Firebase config - replace with your actual config
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "placeholder-api-key",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "placeholder.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "placeholder-project",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "placeholder.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
};

// Check if Firebase config is properly set
const isFirebaseConfigured = process.env.EXPO_PUBLIC_FIREBASE_API_KEY && 
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY !== "placeholder-api-key";

let app: any;
let auth: any;
let db: any;

if (isFirebaseConfigured) {
  // Initialize Firebase only if properly configured
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  
  // Initialize Firebase Authentication
  try {
    auth = getAuth(app);
  } catch (error) {
    console.warn('Firebase Auth initialization failed:', error);
    auth = null;
  }
  
  // Initialize Cloud Firestore
  try {
    db = getFirestore(app);
  } catch (error) {
    console.warn('Firestore initialization failed:', error);
    db = null;
  }
} else {
  // Create mock implementations for development
  console.warn('Firebase not configured. Using mock implementations.');
  app = null;
  auth = null;
  db = null;
}

export { auth, db };
export default app;