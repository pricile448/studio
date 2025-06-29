'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, reload, updateProfile, updatePassword, UserCredential } from 'firebase/auth';
import { getFirebaseServices } from '@/lib/firebase/config';
import { addUserToFirestore, getUserFromFirestore, UserProfile, updateUserInFirestore, RegistrationData, Document, softDeleteUserMessage, deleteChatSession } from '@/lib/firebase/firestore';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import { uploadToCloudinary } from '@/services/cloudinary-service';

// Initialize default (client-side) Firebase services
const { auth, db } = getFirebaseServices();

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  signup: (userData: RegistrationData, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
  updateUserProfileData: (data: Partial<UserProfile>) => Promise<void>;
  updateUserPassword: (password: string) => Promise<void>;
  updateKycStatus: (status: 'pending') => Promise<void>;
  requestCard: () => Promise<void>;
  uploadDocument: (file: File, documentName: string) => Promise<void>;
  deleteConversation: (chatId: string) => Promise<void>;
  deleteMessage: (chatId: string, messageId: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
    return userCredential;
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

  const logout = async () => {
    await signOut(auth);
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
    await updateUserInFirestore(user.uid, { kycStatus: status, kycSubmittedAt: serverTimestamp() });
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

  const uploadDocument = async (file: File, documentName: string) => {
      if (!user || !userProfile) throw new Error("User not authenticated");
      
      const reader = new FileReader();
      const fileReadPromise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const dataUri = await fileReadPromise;
      const folder = `user_documents/${user.uid}`;
      const url = await uploadToCloudinary(dataUri, folder);
      
      const newDocument: Document = {
        id: `doc_${Date.now()}`,
        name: documentName,
        url: url,
        createdAt: Timestamp.now()
      };

      const updatedDocuments = [...(userProfile.documents || []), newDocument];
      await updateUserInFirestore(user.uid, { documents: updatedDocuments });
      
      // Refresh local state
      const profile = await getUserFromFirestore(user.uid);
      setUserProfile(profile);
  };

  const deleteConversation = async (chatId: string) => {
    await deleteChatSession(chatId, db);
  };

  const deleteMessage = async (chatId: string, messageId: string) => {
    await softDeleteUserMessage(chatId, messageId);
  };

  const value = { user, userProfile, loading, login, signup, logout, resendVerificationEmail, checkEmailVerification, updateUserProfileData, updateUserPassword, updateKycStatus, requestCard, uploadDocument, deleteConversation, deleteMessage };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
