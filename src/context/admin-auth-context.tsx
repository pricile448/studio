
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, reload, updateProfile, updatePassword, UserCredential } from 'firebase/auth';
import { getFirebaseServices } from '@/lib/firebase/config';
import { getUserFromFirestore, UserProfile, deleteChatSession, hardDeleteMessage } from '@/lib/firebase/firestore';
import { doc, getDoc } from "firebase/firestore";

// Initialize admin-specific Firebase services
const { auth: adminAuth, db: adminDb } = getFirebaseServices('admin');

type AdminAuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  deleteConversation: (chatId: string) => Promise<void>;
  deleteAdminMessage: (chatId: string, messageId: string) => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(adminAuth, async (user) => {
      setLoading(true); // Set loading to true whenever auth state might change
      setUser(user);
      if (user) {
        // Check for admin privileges
        const adminRef = doc(adminDb, 'admins', user.uid);
        const adminSnap = await getDoc(adminRef);

        if (adminSnap.exists()) {
          setIsAdmin(true);
          const profile = await getUserFromFirestore(user.uid, adminDb);
          setUserProfile(profile);
        } else {
          setIsAdmin(false);
          setUserProfile(null);
          // Log out non-admin users immediately to prevent access
          await signOut(adminAuth);
          // After sign out, onAuthStateChanged will fire again with user=null
          // which will correctly set loading to false. We can return here to avoid a redundant setLoading(false).
          return;
        }

      } else {
        setIsAdmin(false);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(adminAuth, email, password);
    
    // Check if the user is an admin after login
    const adminRef = doc(adminDb, 'admins', userCredential.user.uid);
    const adminSnap = await getDoc(adminRef);

    if (!adminSnap.exists()) {
        await signOut(adminAuth);
        throw new Error("Vous n'avez pas les autorisations nécessaires pour accéder à cette section.");
    }
    
    return userCredential;
  };

  const logout = async () => {
    await signOut(adminAuth);
  };
  
  const deleteConversation = async (chatId: string) => {
    await deleteChatSession(chatId, adminDb);
  };

  const deleteAdminMessage = async (chatId: string, messageId: string) => {
      await hardDeleteMessage(chatId, messageId, adminDb);
  };

  const value = { user, userProfile, loading, isAdmin, login, logout, deleteConversation, deleteAdminMessage };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
