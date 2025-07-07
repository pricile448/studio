
'use client';

import * as React from 'react';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, reload, updateProfile, updatePassword, UserCredential } from 'firebase/auth';
import { getFirebaseServices } from '@/lib/firebase/config';
import { addUserToFirestore, getUserFromFirestore, UserProfile, updateUserInFirestore, RegistrationData, Document, softDeleteUserMessage, deleteChatSession, PhysicalCardType, PhysicalCard, Beneficiary, addBeneficiary as addBeneficiaryToDb, deleteBeneficiary as deleteBeneficiaryFromDb, Transaction, requestTransfer as requestTransferInDb } from '@/lib/firebase/firestore';
import { serverTimestamp, Timestamp, deleteField } from 'firebase/firestore';
import { getCloudinaryUrl } from '@/app/actions';
import { sendVerificationCode } from '@/ai/flows/send-verification-code-flow';
import { verifyEmailCode } from '@/ai/flows/verify-email-code-flow';

// Initialize default (client-side) Firebase services
const { auth, db } = getFirebaseServices();

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isBalanceVisible: boolean;
  toggleBalanceVisibility: () => void;
  refreshUserProfile: () => Promise<void>;
  login: (email: string, password: string) => Promise<UserCredential>;
  signup: (userData: RegistrationData, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
  updateUserProfileData: (data: Partial<UserProfile>) => Promise<void>;
  updateUserPassword: (password: string) => Promise<void>;
  updateAvatar: (file: File) => Promise<void>;
  requestCard: (cardType: PhysicalCardType) => Promise<void>;
  requestVirtualCard: () => Promise<void>;
  deleteConversation: (chatId: string) => Promise<void>;
  deleteMessage: (chatId: string, messageId: string) => Promise<void>;
  addBeneficiary: (beneficiaryData: Omit<Beneficiary, 'id'>) => Promise<void>;
  deleteBeneficiary: (beneficiaryId: string) => Promise<void>;
  requestTransfer: (transferData: Omit<Transaction, 'id' | 'status' | 'type' | 'date'>) => Promise<void>;
  verifyCode: (code: string) => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isBalanceVisible, setIsBalanceVisible] = React.useState(true);

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(prev => !prev);
  };

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
        // Even if not verified, proceed with login but let the UI handle redirection
        // based on the `user.emailVerified` property.
        console.log("User email not verified, but login successful.");
    }
    
    // Update last sign-in time in Firestore
    if (userCredential.user.metadata.lastSignInTime) {
      await updateUserInFirestore(userCredential.user.uid, { 
          lastSignInTime: new Date(userCredential.user.metadata.lastSignInTime) 
      });
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
    
    await sendVerificationCode({
        userId: user.uid,
        email: user.email!,
        userName: userData.firstName,
    });
  };
  
  const resendVerificationEmail = async () => {
    if (auth.currentUser && userProfile) {
        await sendVerificationCode({
            userId: auth.currentUser.uid,
            email: auth.currentUser.email!,
            userName: userProfile.firstName,
        });
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
  
  const verifyCode = async (code: string) => {
    if (!user) throw new Error("No user is signed in.");
    const result = await verifyEmailCode({ userId: user.uid, code });
    if (result.success) {
      // Manually refresh the user object to get the latest `emailVerified` status
      await reload(user);
      // Update the user state in the context
      setUser(auth.currentUser);
    }
    return result;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserProfileData = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error("No user is signed in.");
    
    await updateUserInFirestore(user.uid, data);
    
    const authProfileUpdate: { displayName?: string; photoURL?: string } = {};

    if (data.firstName || data.lastName) {
       authProfileUpdate.displayName = `${data.firstName || userProfile?.firstName} ${data.lastName || userProfile?.lastName}`;
    }
    if (data.photoURL) {
        authProfileUpdate.photoURL = data.photoURL;
    }

    if (Object.keys(authProfileUpdate).length > 0) {
        await updateProfile(user, authProfileUpdate);
    }
    
    // Refresh local state
    await refreshUserProfile();
  }

  const updateUserPassword = async (password: string) => {
    if (!auth.currentUser) throw new Error("No user is signed in.");
    await updatePassword(auth.currentUser, password);
  }

  const updateAvatar = async (file: File) => {
    if (!user) throw new Error("User not authenticated");

    const reader = new FileReader();
    const dataUri = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const result = await getCloudinaryUrl(user.uid, dataUri, 'avatars', file.name);

    if (result.success && result.url) {
      await updateUserProfileData({ photoURL: result.url });
    } else {
      throw new Error(result.error || 'Avatar upload failed');
    }
  };
  
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

  const value = { user, userProfile, loading, refreshUserProfile, login, signup, logout, resendVerificationEmail, checkEmailVerification, updateUserProfileData, updateUserPassword, updateAvatar, requestCard, requestVirtualCard, deleteConversation, deleteMessage, addBeneficiary, deleteBeneficiary, requestTransfer, isBalanceVisible, toggleBalanceVisibility, verifyCode };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
