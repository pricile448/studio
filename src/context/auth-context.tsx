
'use client';

import * as React from 'react';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, reload, updateProfile, updatePassword, UserCredential } from 'firebase/auth';
import { getFirebaseServices } from '@/lib/firebase/config';
import { addUserToFirestore, getUserFromFirestore, UserProfile, updateUserInFirestore, RegistrationData, Document, softDeleteUserMessage, deleteChatSession, PhysicalCardType, PhysicalCard, Beneficiary, addBeneficiary as addBeneficiaryToDb, deleteBeneficiary as deleteBeneficiaryFromDb, Transaction, requestTransfer as requestTransferInDb } from '@/lib/firebase/firestore';
import { serverTimestamp, Timestamp, deleteField } from 'firebase/firestore';
import { uploadToCloudinary } from '@/services/cloudinary-service';

// Initialize default (client-side) Firebase services
const { auth, db } = getFirebaseServices();

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refreshUserProfile: () => Promise<void>;
  login: (email: string, password: string) => Promise<UserCredential>;
  signup: (userData: RegistrationData, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
  updateUserProfileData: (data: Partial<UserProfile>) => Promise<void>;
  updateUserPassword: (password: string) => Promise<void>;
  requestCard: (cardType: PhysicalCardType) => Promise<void>;
  requestVirtualCard: () => Promise<void>;
  uploadDocument: (file: File, documentName: string) => Promise<void>;
  deleteConversation: (chatId: string) => Promise<void>;
  deleteMessage: (chatId: string, messageId: string) => Promise<void>;
  addBeneficiary: (beneficiaryData: Omit<Beneficiary, 'id'>) => Promise<void>;
  deleteBeneficiary: (beneficiaryId: string) => Promise<void>;
  requestTransfer: (transferData: Omit<Transaction, 'id' | 'status' | 'type' | 'date'>) => Promise<void>;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
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
  
  const refreshUserProfile = async () => {
    if (user) {
        // Do not set global loading to true for a background refresh
        // to avoid a full-screen loader flash.
        const profile = await getUserFromFirestore(user.uid);
        setUserProfile(profile);
    }
  };

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
    await refreshUserProfile();
  }

  const updateUserPassword = async (password: string) => {
    if (!auth.currentUser) throw new Error("No user is signed in.");
    await updatePassword(auth.currentUser, password);
  }
  
  const requestCard = async (cardType: PhysicalCardType) => {
    if (!user) throw new Error("No user is signed in.");

    const requestData: Partial<UserProfile> = {
      cardStatus: 'requested',
      cardRequestedAt: serverTimestamp(),
      cardType,
    };
    
    await updateUserInFirestore(user.uid, requestData);
    await refreshUserProfile();
  };

  const requestVirtualCard = async () => {
    if (!user) throw new Error("No user is signed in.");
    await updateUserInFirestore(user.uid, { 
        hasPendingVirtualCardRequest: true,
        virtualCardRequestedAt: serverTimestamp(),
    });
    await refreshUserProfile();
  }

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
      const url = await uploadToCloudinary(dataUri, folder, file.name);
      
      const newDocument: Document = {
        id: `doc_${Date.now()}`,
        name: documentName,
        url: url,
        createdAt: Timestamp.now()
      };

      const updatedDocuments = [...(userProfile.documents || []), newDocument];
      await updateUserInFirestore(user.uid, { documents: updatedDocuments });
      
      // Refresh local state
      await refreshUserProfile();
  };

  const deleteConversation = async (chatId: string) => {
    await deleteChatSession(chatId, db);
  };

  const deleteMessage = async (chatId: string, messageId: string) => {
    await softDeleteUserMessage(chatId, messageId);
  };
  
  const addBeneficiary = async (beneficiaryData: Omit<Beneficiary, 'id'>) => {
    if (!user) throw new Error("User not authenticated");
    await addBeneficiaryToDb(user.uid, beneficiaryData, db);
    await refreshUserProfile();
  };

  const deleteBeneficiary = async (beneficiaryId: string) => {
    if (!user) throw new Error("User not authenticated");
    await deleteBeneficiaryFromDb(user.uid, beneficiaryId, db);
    await refreshUserProfile();
  }
  
  const requestTransfer = async (transferData: Omit<Transaction, 'id' | 'status' | 'type' | 'date'>) => {
    if (!user) throw new Error("User not authenticated");
    await requestTransferInDb(user.uid, transferData, db);
    await refreshUserProfile();
  };

  const value = { user, userProfile, loading, refreshUserProfile, login, signup, logout, resendVerificationEmail, checkEmailVerification, updateUserProfileData, updateUserPassword, requestCard, requestVirtualCard, uploadDocument, deleteConversation, deleteMessage, addBeneficiary, deleteBeneficiary, requestTransfer };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
