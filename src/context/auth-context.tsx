'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, reload, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { addUserToFirestore, getUserFromFirestore, UserProfile } from '@/lib/firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import type { Locale } from '@/lib/dictionaries';

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isLoggingOut: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Omit<UserProfile, 'uid' | 'createdAt'>, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const lang = (pathname.split('/')[1] as Locale) || 'fr';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const profile = await getUserFromFirestore(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (!userCredential.user.emailVerified) {
        await signOut(auth);
        throw new Error('auth/email-not-verified');
    }
    router.push(`/${lang}/dashboard`);
    router.refresh();
  };

  const signup = async (userData: Omit<UserProfile, 'uid' | 'createdAt'>, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
    const { user } = userCredential;

    await updateProfile(user, {
      displayName: `${userData.firstName} ${userData.lastName}`
    });
    
    await addUserToFirestore({
      ...userData,
      uid: user.uid,
    });

    await sendEmailVerification(userCredential.user);
  };
  
  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
    } else {
        throw new Error("No user is signed in to resend verification email.");
    }
  }

  const checkEmailVerification = async () => {
    if (!auth.currentUser) {
      // This can happen if the user clicks the link in a different browser.
      // We can't check verification without a logged-in user.
      // The auth/action page handles the actual verification.
      return false;
    }
    await reload(auth.currentUser);
    if (auth.currentUser.emailVerified) {
      setUser(auth.currentUser); // Update state with the now-verified user
      return true;
    }
    return false;
  };


  const logout = async () => {
    setIsLoggingOut(true);
    await signOut(auth);
    // Force a full page reload to clear all state and redirect to home.
    window.location.href = `/${lang}`;
  };

  const value = { user, userProfile, loading, isLoggingOut, login, signup, logout, resendVerificationEmail, checkEmailVerification };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
