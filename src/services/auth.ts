import { signInWithPopup, signOut as firebaseSignOut, User } from 'firebase/auth';
import { auth, googleProvider } from '@/config/firebase';

export const signInWithGoogle = async (): Promise<User> => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

export const getCurrentUser = (): User | null => auth.currentUser;
