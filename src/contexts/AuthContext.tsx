import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, UserRole } from '@/types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  dept?: string;
  year?: number;
  rollNo?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({
              uid: fbUser.uid,
              email: fbUser.email || '',
              name: data.name,
              role: data.role,
              dept: data.dept,
              year: data.year,
              cgpa: data.cgpa,
              createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            });
          } else {
            console.warn('User authenticated but no Firestore document found.');
            toast.error('Account incomplete. Please sign up again.');
            await signOut(auth); // Clean up zombie session
            setUser(null);
          }
        } catch (err) {
          console.error('Error fetching user profile from Firestore:', err);
          toast.error('Could not load user profile. Check database permissions.');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    const timeout = setTimeout(() => setIsLoading(false), 5000);
    return () => { unsubscribe(); clearTimeout(timeout); };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setIsLoading(false);
      const msg =
        err.code === 'auth/user-not-found' ? 'No account found with this email.' :
        err.code === 'auth/wrong-password' ? 'Incorrect password.' :
        err.code === 'auth/invalid-credential' ? 'Invalid email or password.' :
        err.message || 'Login failed.';
      toast.error(msg);
      throw err;
    }
  };

  const signup = async (data: SignupData) => {
    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      try {
        const userProfile: any = {
          uid: cred.user.uid,
          email: data.email,
          name: data.name,
          role: data.role,
          dept: data.dept || null,
          year: data.year || null,
          cgpa: null,
          createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'users', cred.user.uid), userProfile);

        // Create student profile if role is student
        if (data.role === 'student') {
          await setDoc(doc(db, 'students', cred.user.uid), {
            uid: cred.user.uid,
            name: data.name,
            email: data.email,
            rollNo: data.rollNo || `${data.dept?.substring(0, 3).toUpperCase()}${Date.now()}`,
            dept: data.dept,
            year: data.year || 1,
            cgpa: 0,
            attendance: {},
            billing: { status: 'pending', amount: 45000, dueDate: '2025-06-30' },
            createdAt: serverTimestamp(),
          });
        }
      } catch (firestoreError: any) {
        // If Firestore write fails (e.g., missing permissions), delete the Auth user!
        console.error('Firestore creation failed:', firestoreError);
        await cred.user.delete();
        throw new Error('Database error during signup. Check Firestore rules.');
      }
    } catch (err: any) {
      setIsLoading(false);
      const errorMsg = err.code === 'auth/email-already-in-use' 
        ? 'Email is already taken. Try signing in.' 
        : (err.message || 'Signup failed.');
      toast.error(errorMsg);
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, firebaseUser, isLoading, isAuthenticated: !!user, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
