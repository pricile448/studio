
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, reload, updateProfile, updatePassword } from 'firebase/auth';
import { auth, storage } from '@/lib/firebase/config';
import { addUserToFirestore, getUserFromFirestore, UserProfile, updateUserInFirestore } from '@/lib/firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import type { Locale } from '@/lib/dictionaries';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
  updateUserAvatar: (file: File) => Promise<void>;
  updateUserProfileData: (data: Partial<UserProfile>) => Promise<void>;
  updateUserPassword: (password: string) => Promise<void>;
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
      return false;
    }
    await reload(auth.currentUser);
    if (auth.currentUser.emailVerified) {
      setUser(auth.currentUser);
      return true;
    }
    return false;
  };

  const logout = async () => {
    setIsLoggingOut(true);
    await signOut(auth);
    window.location.href = `/${lang}`;
  };
  
  const updateUserAvatar = async (file: File) => {
    if (!user) throw new Error("No user is signed in.");

    const storageRef = ref(storage, `avatars/${user.uid}`);
    const snapshot = await uploadBytes(storageRef, file);
    const photoURL = await getDownloadURL(snapshot.ref);

    await updateProfile(user, { photoURL });
    await updateUserInFirestore(user.uid, { photoURL });
    
    // Optimistically update state to avoid waiting for a full reload
    const updatedUser = { ...user, photoURL };
    setUser(updatedUser as User);

    if (userProfile) {
      const updatedProfile = { ...userProfile, photoURL };
      setUserProfile(updatedProfile);
    }
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

  const value = { user, userProfile, loading, isLoggingOut, login, signup, logout, resendVerificationEmail, checkEmailVerification, updateUserAvatar, updateUserProfileData, updateUserPassword };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
