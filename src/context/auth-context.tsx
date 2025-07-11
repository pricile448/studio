
'use client';

import * as React from 'react';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, reload, updateProfile, updatePassword, UserCredential, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { getFirebaseServices } from '@/lib/firebase/config';
import { getUserFromFirestore, UserProfile, updateUserInFirestore, RegistrationData, Document, softDeleteUserMessage, deleteChatSession, PhysicalCardType, PhysicalCard, Beneficiary, addBeneficiary as addBeneficiaryToDb, deleteBeneficiary as deleteBeneficiaryFromDb, Transaction, requestTransfer as requestTransferInDb } from '@/lib/firebase/firestore';
import { serverTimestamp, Timestamp, deleteField } from 'firebase/firestore';
import { getCloudinaryUrl } from '@/app/actions';
import { sendVerificationCode } from '@/ai/flows/send-verification-code-flow';
import { verifyEmailCode } from '@/ai/flows/verify-email-code-flow';
import { createUserDocument } from '@/ai/flows/create-user-document-flow';

// Initialize default (client-side) Firebase services
const { auth, db } = getFirebaseServices();

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: RegistrationData, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  updateUserPassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  verifyCode: (code: string) => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        if (!userCredential.user.emailVerified) {
             return { success: false, error: 'emailNotVerified' };
        }

        if (userCredential.user.metadata.lastSignInTime) {
          await updateUserInFirestore(userCredential.user.uid, { 
              lastSignInTime: new Date(userCredential.user.metadata.lastSignInTime) 
          });
        }
        return { success: true };
    } catch (error: any) {
        if (error.code === 'auth/invalid-credential') {
            return { success: false, error: 'wrongCredentials' };
        }
        console.error("Unexpected Firebase Login Error:", error);
        return { success: false, error: 'api.unexpected' };
    }
  };

  const signup = async (userData: RegistrationData, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
      const { user } = userCredential;

      await updateProfile(user, {
        displayName: `${userData.firstName} ${userData.lastName}`
      });

      const createUserDocResult = await createUserDocument({
          ...userData,
          uid: user.uid,
          dob: userData.dob.toISOString(), // Pass date as ISO string
      });
      
      if (!createUserDocResult || !createUserDocResult.success) {
          throw new Error(createUserDocResult?.error || "La création du profil utilisateur a échoué.");
      }
      
      const sendCodeResult = await sendVerificationCode({
          userId: user.uid,
          email: user.email!,
          userName: userData.firstName,
      });

      if (!sendCodeResult || !sendCodeResult.success) {
        throw new Error(sendCodeResult?.error || "Échec de l'envoi de l'e-mail de vérification.");
      }
      return { success: true };
    } catch (error: any) {
        if (auth.currentUser) {
            await auth.currentUser.delete().catch(e => console.error("Failed to delete temporary auth user:", e));
        }
        
        if (error.code === 'auth/email-already-in-use') {
          return { success: false, error: 'emailInUse' };
        }
        if (error.code === 'auth/weak-password') {
          return { success: false, error: 'weakPassword' };
        }

        console.error("Unexpected Firebase Signup Error:", error);
        return { success: false, error: 'api.unexpected' };
    }
  };
  
  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
      // We need a user profile to get the name for the email template
      const tempProfile = await getUserFromFirestore(auth.currentUser.uid);
      if (tempProfile) {
        const result = await sendVerificationCode({
            userId: auth.currentUser.uid,
            email: auth.currentUser.email!,
            userName: tempProfile.firstName,
        });
        
        if (!result || !result.success) {
          throw new Error(result?.error || "Failed to resend verification email.");
        }
      } else {
         throw new Error("User profile not found, cannot send email.");
      }
    } else {
        throw new Error("No user is signed in to resend verification email.");
    }
  }
  
  const verifyCode = async (code: string) => {
    if (!auth.currentUser) throw new Error("No user is signed in.");
    const result = await verifyEmailCode({ userId: auth.currentUser.uid, code });
    if (result.success) {
      await reload(auth.currentUser);
      setUser(auth.currentUser);
    }
    return result;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserPassword = async (currentPass: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
    if (!auth.currentUser || !auth.currentUser.email) return { success: false, error: 'api.unexpected' };
    
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPass);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPass);
      return { success: true };
    } catch (error: any) {
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            return { success: false, error: 'wrongCredentials' };
        }
        if (error.code === 'auth/requires-recent-login') {
            return { success: false, error: 'reauthRequired' };
        }
        console.error("Unexpected Firebase Password Update Error:", error);
        return { success: false, error: 'api.unexpected' };
    }
  }

  const value = { user, loading, login, signup, logout, resendVerificationEmail, updateUserPassword, verifyCode };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// User Profile Context
type UserProfileContextType = {
  userProfile: UserProfile | null;
  loading: boolean;
  isBalanceVisible: boolean;
  toggleBalanceVisibility: () => void;
  refreshUserProfile: () => Promise<void>;
  updateUserProfileData: (data: Partial<UserProfile>) => Promise<void>;
  updateAvatar: (file: File) => Promise<void>;
  requestCard: (cardType: PhysicalCardType) => Promise<void>;
  requestVirtualCard: () => Promise<void>;
  deleteConversation: (chatId: string) => Promise<void>;
  deleteMessage: (chatId: string, messageId: string) => Promise<void>;
  addBeneficiary: (beneficiaryData: Omit<Beneficiary, 'id'>) => Promise<void>;
  deleteBeneficiary: (beneficiaryId: string) => Promise<void>;
  requestTransfer: (transferData: Omit<Transaction, 'id' | 'status' | 'type' | 'date'>) => Promise<void>;
};

const UserProfileContext = React.createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
    const [profileLoading, setProfileLoading] = React.useState(true);
    const [isBalanceVisible, setIsBalanceVisible] = React.useState(true);

    const toggleBalanceVisibility = () => {
        setIsBalanceVisible(prev => !prev);
    };
    
    const fetchUserProfile = React.useCallback(async (uid: string) => {
        const profile = await getUserFromFirestore(uid);
        setUserProfile(profile);
        setProfileLoading(false);
    }, []);

    React.useEffect(() => {
        if (user) {
            setProfileLoading(true);
            fetchUserProfile(user.uid);
        } else if (!authLoading) {
            setUserProfile(null);
            setProfileLoading(false);
        }
    }, [user, authLoading, fetchUserProfile]);

    const refreshUserProfile = React.useCallback(async () => {
        if (user) {
            await fetchUserProfile(user.uid);
        }
    }, [user, fetchUserProfile]);

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
        
        await refreshUserProfile();
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


    const value = {
        userProfile,
        loading: authLoading || profileLoading,
        isBalanceVisible,
        toggleBalanceVisibility,
        refreshUserProfile,
        updateUserProfileData,
        updateAvatar,
        requestCard,
        requestVirtualCard,
        deleteConversation,
        deleteMessage,
        addBeneficiary,
        deleteBeneficiary,
        requestTransfer,
    };

    return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>
}

export function useUserProfile() {
  const context = React.useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}
