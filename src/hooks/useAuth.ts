import { useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';

export interface UserData {
  uid: string;
  email: string;
  role: 'agent' | 'patient' | 'hospital';
  name: string;
  phone: string;
  companyName?: string;
  companyId?: string;
  dob?: string;
  gender?: string;
  address?: string;
  preExistingConditions?: string[]; // Added this line for patient pre-existing conditions
  hospitalName?: string;
  hospitalAddress?: string;
  registrationNumber?: string;
  createdAt?: string;
  emailVerified?: boolean; // Added for tracking verification status
  accountStatus?: 'pending' | 'active' | 'suspended' | 'pending_verification'; // Added for account status tracking
}

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserData);
          } else {
            console.warn('No user data found in Firestore for uid:', firebaseUser.uid);
            setUserData(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Fetch user data from Firestore
      const docRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        // This shouldn't happen if registration completed successfully
        console.warn('User authenticated but no Firestore record found');
        return { 
          success: false, 
          error: 'User profile not found. Please contact support.' 
        };
      }
      
      const userData = docSnap.data() as UserData;
      
      return { 
        success: true, 
        user: firebaseUser,
        userData 
      };
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Map Firebase error codes to user-friendly messages
      let errorMessage = 'Login failed';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Please contact support.';
      } else {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const register = async (
    email: string, 
    password: string, 
    userData: Omit<UserData, 'uid' | 'createdAt' | 'emailVerified' | 'accountStatus'>
  ) => {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Determine account status based on role
      let accountStatus = 'active';
      if (userData.role === 'hospital') {
        accountStatus = 'pending_verification'; // Hospitals need verification
      } else if (userData.role === 'agent') {
        accountStatus = 'pending'; // Agents might need approval
      }
      
      // Store user data in Firestore
      const userRef = doc(db, 'users', user.uid);
      const firestoreData = {
        ...userData,
        uid: user.uid,
        email: user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: false,
        accountStatus: accountStatus
      };
      
      await setDoc(userRef, firestoreData);
      
      // Send email verification
      await sendEmailVerification(user);
      
      return { 
        success: true, 
        user,
        userData: firestoreData
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Map Firebase error codes to user-friendly messages
      let errorMessage = 'Registration failed';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else {
        errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  const refreshUserData = async () => {
    if (!user) return;
    
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data() as UserData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  return {
    user,
    userData,
    loading,
    login,
    register,
    logout,
    refreshUserData
  };
}