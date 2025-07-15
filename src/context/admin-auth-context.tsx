
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, reload, updateProfile, updatePassword, UserCredential } from 'firebase/auth';
import { getFirebaseServices } from '@/lib/firebase/config';
import { getUserFromFirestore, UserProfile, deleteChatSession, hardDeleteMessage } from '@/lib/firebase/firestore';
import { getAdminDb, getAdminAuth } from '@/lib/firebase/admin';
import { doc, getDoc } from "firebase/firestore";

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
  
  const adminAuth = getAdminAuth();

  useEffect(() => {
    if (!adminAuth) {
        setLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(adminAuth, async (user) => {
      setLoading(true); // Set loading to true whenever auth state might change
      setUser(user);
      if (user) {
        try {
          const adminDb = getAdminDb();
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
        } catch (error) {
            console.error("Error during admin auth check:", error);
            setIsAdmin(false);
            setUserProfile(null);
            await signOut(adminAuth);
        }

      } else {
        setIsAdmin(false);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [adminAuth]);

  const login = async (email: string, password: string) => {
    if (!adminAuth) throw new Error("Admin Auth not initialized");
    const userCredential = await signInWithEmailAndPassword(adminAuth, email, password);
    
    try {
        const adminDb = getAdminDb();
        // Check if the user is an admin after login
        const adminRef = doc(adminDb, 'admins', userCredential.user.uid);
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) {
            await signOut(adminAuth);
            throw new Error("Vous n'avez pas les autorisations nécessaires pour accéder à cette section.");
        }
    } catch(error) {
        await signOut(adminAuth);
        throw error;
    }
    
    return userCredential;
  };

  const logout = async () => {
    if (!adminAuth) return;
    await signOut(adminAuth);
  };
  
  const deleteConversation = async (chatId: string) => {
    const adminDb = getAdminDb();
    await deleteChatSession(chatId, adminDb);
  };

  const deleteAdminMessage = async (chatId: string, messageId: string) => {
      const adminDb = getAdminDb();
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
