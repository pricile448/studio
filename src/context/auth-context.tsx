'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { addUserToFirestore, UserProfile } from '@/lib/firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import type { Locale } from '@/lib/dictionaries';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Omit<UserProfile, 'uid' | 'createdAt'>, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const lang = (pathname.split('/')[1] as Locale) || 'fr';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
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
    const { uid } = userCredential.user;
    
    await addUserToFirestore({
      ...userData,
      uid,
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

  const logout = async () => {
    await signOut(auth);
    window.location.href = `/${lang}`;
  };

  const value = { user, loading, login, signup, logout, resendVerificationEmail };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
