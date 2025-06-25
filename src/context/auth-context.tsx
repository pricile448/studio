
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, reload, updateProfile, updatePassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { addUserToFirestore, getUserFromFirestore, UserProfile, updateUserInFirestore, RegistrationData } from '@/lib/firebase/firestore';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/lib/dictionaries';
import { serverTimestamp } from 'firebase/firestore';

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isLoggingOut: boolean;
  login: (email: string, password: string, lang: Locale) => Promise<void>;
  signup: (userData: RegistrationData, password: string) => Promise<void>;
  logout: (lang: Locale) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
  updateUserProfileData: (data: Partial<UserProfile>) => Promise<void>;
  updateUserPassword: (password: string) => Promise<void>;
  updateKycStatus: (status: 'pending') => Promise<void>;
  requestCard: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

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

  const login = async (email: string, password: string, lang: Locale) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (!userCredential.user.emailVerified) {
        await signOut(auth);
        throw new Error('auth/email-not-verified');
    }
    router.push(`/${lang}/dashboard`);
    router.refresh();
  };

  const signup = async (userData: RegistrationData, password: string) => {
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
      return false;
    }
    await reload(auth.currentUser);
    if (auth.currentUser.emailVerified) {
      setUser(auth.currentUser);
      return true;
    }
    return false;
  };

  const logout = async (lang: Locale) => {
    setIsLoggingOut(true);
    await signOut(auth);
    window.location.href = `/${lang}`;
  };

  const updateUserProfileData = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error("No user is signed in.");
    
    await updateUserInFirestore(user.uid, data);
    
    if (data.firstName || data.lastName) {
       await updateProfile(user, { displayName: `${data.firstName || userProfile?.firstName} ${data.lastName || userProfile?.lastName}` });
    }
    
    // Refresh local state
    const profile = await getUserFromFirestore(user.uid);
    setUserProfile(profile);
    setUser(auth.currentUser);
  }

  const updateUserPassword = async (password: string) => {
    if (!auth.currentUser) throw new Error("No user is signed in.");
    await updatePassword(auth.currentUser, password);
  }

  const updateKycStatus = async (status: 'pending') => {
    if (!user) throw new Error("No user is signed in.");
    await updateUserInFirestore(user.uid, { kycStatus: status });
    // Refresh local state
    const profile = await getUserFromFirestore(user.uid);
    setUserProfile(profile);
  };
  
  const requestCard = async () => {
    if (!user) throw new Error("No user is signed in.");
    await updateUserInFirestore(user.uid, { cardStatus: 'requested', cardRequestedAt: serverTimestamp() });
    // Refresh local state
    const profile = await getUserFromFirestore(user.uid);
    setUserProfile(profile);
  };

  const value = { user, userProfile, loading, isLoggingOut, login, signup, logout, resendVerificationEmail, checkEmailVerification, updateUserProfileData, updateUserPassword, updateKycStatus, requestCard };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
