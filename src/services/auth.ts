import {
    createUserWithEmailAndPassword,
    User as FirebaseUser,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { LoginFormData, SignupFormData, User } from '../types';
import { userService } from './firestore';

export class AuthService {
  static async signUpWithEmail(formData: SignupFormData): Promise<User> {
    if (!auth) {
      throw new Error('Firebase not configured. Please set up your Firebase configuration.');
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      // Update the display name
      await updateProfile(userCredential.user, {
        displayName: formData.name,
      });

      const user: User = {
        id: userCredential.user.uid,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
        photoUrl: userCredential.user.photoURL || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save user to Firestore
      await userService.create(user);

      return user;
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  static async signInWithEmail(formData: LoginFormData): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      // Get user data from Firestore
      const userData = await userService.get(userCredential.user.uid);
      if (!userData) {
        throw new Error('User data not found');
      }

      return userData;
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  static onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userData = await userService.get(firebaseUser.uid);
          callback(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    await userService.update(userId, updates);
  }

  private static getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No user found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}