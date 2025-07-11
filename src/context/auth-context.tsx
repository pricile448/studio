
'use client';

import * as React from 'react';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, reload, updateProfile, updatePassword, UserCredential, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { getFirebaseServices } from '@/lib/firebase/config';
import { RegistrationData, updateUserInFirestore } from '@/lib/firebase/firestore';
import { sendVerificationCode } from '@/ai/flows/send-verification-code-flow';
import { verifyEmailCode } from '@/ai/flows/verify-email-code-flow';
import { createUserDocument } from '@/ai/flows/create-user-document-flow';

// Initialize default (client-side) Firebase services
const { auth } = getFirebaseServices();

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserPassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  verifyCode: (code: string) => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        if (!userCredential.user.emailVerified) {
             // This case is now handled in the verify-email logic directly
        }

        if (userCredential.user.metadata.lastSignInTime) {
          await updateUserInFirestore(userCredential.user.uid, { 
              lastSignInTime: new Date(userCredential.user.metadata.lastSignInTime) 
          });
        }
        return { success: true };
    } catch (error: any) {
        if (error.code === 'auth/invalid-credential') {
            return { success: false, error: 'wrongCredentials' };
        }
        console.error("Unexpected Firebase Login Error:", error);
        return { success: false, error: 'api.unexpected' };
    }
  };
  
  const verifyCode = async (code: string) => {
    if (!auth.currentUser) throw new Error("No user is signed in.");
    const result = await verifyEmailCode({ userId: auth.currentUser.uid, code });
    if (result.success) {
      await reload(auth.currentUser);
      setUser(auth.currentUser);
    }
    return result;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserPassword = async (currentPass: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
    if (!auth.currentUser || !auth.currentUser.email) return { success: false, error: 'api.unexpected' };
    
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPass);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPass);
      return { success: true };
    } catch (error: any) {
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            return { success: false, error: 'wrongCredentials' };
        }
        if (error.code === 'auth/requires-recent-login') {
            return { success: false, error: 'reauthRequired' };
        }
        console.error("Unexpected Firebase Password Update Error:", error);
        return { success: false, error: 'api.unexpected' };
    }
  }

  const value = { user, loading, login, logout, updateUserPassword, verifyCode };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
