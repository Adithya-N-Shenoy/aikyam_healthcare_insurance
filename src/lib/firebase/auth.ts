import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './client';

export type UserRole = 'agent' | 'patient' | 'hospital';

export interface UserData {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
  phone: string;
  createdAt: Date;
  // Agent specific
  companyName?: string;
  companyId?: string;
  // Patient specific
  dob?: string;
  gender?: string;
  address?: string;
  preExistingConditions?: string[];
  // Hospital specific
  hospitalName?: string;
  hospitalAddress?: string;
  registrationNumber?: string;
}

export const registerUser = async (
  email: string, 
  password: string, 
  userData: Omit<UserData, 'uid' | 'createdAt'>
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Store additional user data in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      ...userData,
      uid: user.uid,
      createdAt: new Date().toISOString(),
      emailVerified: false
    });
    
    await sendEmailVerification(user);
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};