import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: 'customer' | 'barber';
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Sign up with email and password
export async function signUp(email: string, password: string, displayName?: string, role: 'customer' | 'barber' = 'customer', extraData: any = {}): Promise<UserCredential> {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile in Firestore
    await setDoc(doc(db, 'users', credential.user.uid), {
      uid: credential.user.uid,
      email: credential.user.email,
      displayName: displayName || '',
      photoURL: '',
      role,
      ...extraData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return credential;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
}

// Sign in with email and password
export async function signIn(email: string, password: string): Promise<UserCredential> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

// Sign out
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

// Get current user
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// Get user profile from Firestore
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Get user profile error:', error);
    throw error;
  }
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Update user profile
export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  try {
    await setDoc(doc(db, 'users', uid), { ...updates, updatedAt: new Date() }, { merge: true });
  } catch (error) {
    console.error('Update user profile error:', error);
    throw error;
  }
}
