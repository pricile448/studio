
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
  signup: (userData: RegistrationData, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
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
             return { success: false, error: 'emailNotVerified' };
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

  const signup = async (userData: RegistrationData, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
      const { user } = userCredential;

      await updateProfile(user, {
        displayName: `${userData.firstName} ${userData.lastName}`
      });

      const createUserDocResult = await createUserDocument({
          ...userData,
          uid: user.uid,
          dob: userData.dob.toISOString(), // Pass date as ISO string
      });
      
      if (!createUserDocResult || !createUserDocResult.success) {
          throw new Error(createUserDocResult?.error || "La création du profil utilisateur a échoué.");
      }
      
      const sendCodeResult = await sendVerificationCode({
          userId: user.uid,
          email: user.email!,
          userName: userData.firstName,
      });

      if (!sendCodeResult || !sendCodeResult.success) {
        throw new Error(sendCodeResult?.error || "Échec de l'envoi de l'e-mail de vérification.");
      }
      return { success: true };
    } catch (error: any) {
        if (auth.currentUser) {
            await auth.currentUser.delete().catch(e => console.error("Failed to delete temporary auth user:", e));
        }
        
        if (error.code === 'auth/email-already-in-use') {
          return { success: false, error: 'emailInUse' };
        }
        if (error.code === 'auth/weak-password') {
          return { success: false, error: 'weakPassword' };
        }

        console.error("Unexpected Firebase Signup Error:", error);
        return { success: false, error: 'api.unexpected' };
    }
  };
  
  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    } else {
        throw new Error("No user is signed in to resend verification email.");
    }
  }
  
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

  const value = { user, loading, login, signup, logout, resendVerificationEmail, updateUserPassword, verifyCode };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
