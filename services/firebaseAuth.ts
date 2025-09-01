import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  User,
  UserCredential
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

// Convert Firebase User to our interface
const mapFirebaseUser = (user: User): FirebaseUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  emailVerified: user.emailVerified,
});

export const firebaseAuth = {
  // Sign in with Google
  signInWithGoogle: async (): Promise<{ user: FirebaseUser; idToken: string }> => {
    try {
      const result: UserCredential = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
      
      return {
        user: mapFirebaseUser(user),
        idToken,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Google sign-in failed');
    }
  },

  // Sign in with email and password
  signInWithEmail: async (email: string, password: string): Promise<{ user: FirebaseUser; idToken: string }> => {
    try {
      const result: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      const idToken = await user.getIdToken();
      
      return {
        user: mapFirebaseUser(user),
        idToken,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Email sign-in failed');
    }
  },

  // Create user with email and password
  createUserWithEmail: async (email: string, password: string): Promise<{ user: FirebaseUser; idToken: string }> => {
    try {
      const result: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      const idToken = await user.getIdToken();
      
      return {
        user: mapFirebaseUser(user),
        idToken,
      };
    } catch (error: any) {
      throw new Error(error.message || 'User creation failed');
    }
  },

  // Sign out
  signOut: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message || 'Sign out failed');
    }
  },

  // Get current user
  getCurrentUser: (): User | null => {
    return auth.currentUser;
  },

  // Get current user's ID token
  getCurrentUserToken: async (): Promise<string | null> => {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return auth.onAuthStateChanged(callback);
  },
};

export default firebaseAuth;
