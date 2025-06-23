
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { addUserToFirestore, UserProfile } from '@/lib/firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { type Locale } from '@/lib/dictionaries';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Omit<UserProfile, 'uid' | 'createdAt'>, password: string) => Promise<void>;
  logout: () => Promise<void>;
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
    await signInWithEmailAndPassword(auth, email, password);
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
    router.push(`/${lang}/dashboard`);
    router.refresh();
  };

  const logout = async () => {
    await signOut(auth);
    router.push(`/${lang}/login`);
  };

  const value = { user, loading, login, signup, logout };

  // Render children only when loading is false to prevent flashing of pages
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
