
'use client';

import * as React from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword, signOut, updateProfile, updatePassword, UserCredential, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { getFirebaseServices } from '@/lib/firebase/config';
import { 
    getUserFromFirestore, 
    updateUserInFirestore, 
    softDeleteUserMessage, 
    deleteChatSession,
    addBeneficiary as addBeneficiaryToDb,
    deleteBeneficiary as deleteBeneficiaryFromDb,
    requestTransfer as requestTransferInDb,
    UserProfile, 
    PhysicalCardType,
    Beneficiary,
    Transaction 
} from '@/lib/firebase/firestore';
import { serverTimestamp, deleteField } from 'firebase/firestore';

const { auth, db } = getFirebaseServices();

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isBalanceVisible: boolean;
  toggleBalanceVisibility: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserPassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  refreshUserProfile: () => Promise<void>;
  updateUserProfileData: (data: Partial<UserProfile>) => Promise<void>;
  requestCard: (cardType: PhysicalCardType) => Promise<void>;
  requestVirtualCard: () => Promise<void>;
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
  const [isBalanceVisible, setIsBalanceVisible] = React.useState(true);

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(prev => !prev);
  };
  
  const fetchUserProfile = React.useCallback(async (uid: string) => {
    setLoading(true);
    try {
        if (!db) throw new Error("Firestore not initialized");
        const profile = await getUserFromFirestore(uid, db);
        setUserProfile(profile);
    } catch (error) {
        console.error("Failed to fetch user profile:", error);
        setUserProfile(null);
    } finally {
        setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!auth) {
        console.error("Firebase Auth is not initialized. Authentication will not work.");
        setLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setUser(user);
        if (user) {
            await fetchUserProfile(user.uid);
        } else {
            setUserProfile(null);
            setLoading(false);
        }
    });
    return () => unsubscribe();
  }, [fetchUserProfile]);
  
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!auth) return { success: false, error: 'api.unexpected' };
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        if (userCredential.user.metadata.lastSignInTime && db) {
          await updateUserInFirestore(userCredential.user.uid, { 
              lastSignInTime: new Date(userCredential.user.metadata.lastSignInTime) 
          }, db);
        }
        return { success: true };
    } catch (error: any) {
        if (error.code === 'auth/invalid-credential') {
            return { success: false, error: 'wrongCredentials' };
        }
         if (error.code === 'auth/network-request-failed') {
            return { success: false, error: 'networkError' };
        }
        console.error("Unexpected Firebase Login Error:", error);
        return { success: false, error: 'api.unexpected' };
    }
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  const updateUserPassword = async (currentPass: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
    if (!auth || !auth.currentUser || !auth.currentUser.email) return { success: false, error: 'api.unexpected' };
    
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

  const refreshUserProfile = React.useCallback(async () => {
    if (user) {
        await fetchUserProfile(user.uid);
    }
  }, [user, fetchUserProfile]);

  const updateUserProfileData = async (data: Partial<UserProfile>) => {
    if (!user || !db) throw new Error("No user is signed in or DB is not available.");
    
    await updateUserInFirestore(user.uid, data, db);
    
    const authProfileUpdate: { displayName?: string; photoURL?: string } = {};

    if (data.firstName || data.lastName) {
        authProfileUpdate.displayName = `${data.firstName || userProfile?.firstName} ${data.lastName || userProfile?.lastName}`;
    }
    if (data.photoURL) {
        authProfileUpdate.photoURL = data.photoURL;
    }

    if (Object.keys(authProfileUpdate).length > 0 && auth.currentUser) {
        await updateProfile(auth.currentUser, authProfileUpdate);
    }
    
    await refreshUserProfile();
  }

  const requestCard = async (cardType: PhysicalCardType) => {
    if (!user || !db) throw new Error("User or DB not available");

    const requestData: Partial<UserProfile> = {
        cardStatus: 'requested',
        cardRequestedAt: serverTimestamp() as any,
        cardType,
    };
    
    await updateUserInFirestore(user.uid, requestData, db);
    await refreshUserProfile();
  };

  const requestVirtualCard = async () => {
    if (!user || !db) throw new Error("User or DB not available");
    await updateUserInFirestore(user.uid, { 
        hasPendingVirtualCardRequest: true,
        virtualCardRequestedAt: serverTimestamp() as any,
    }, db);
    await refreshUserProfile();
  }

  const deleteMessage = async (chatId: string, messageId: string) => {
    if (!db) throw new Error("DB not available");
    await softDeleteUserMessage(chatId, messageId, db);
  };
  
  const addBeneficiary = async (beneficiaryData: Omit<Beneficiary, 'id'>) => {
    if (!user || !db) throw new Error("User not authenticated or DB not available");
    await addBeneficiaryToDb(user.uid, beneficiaryData, db);
    await refreshUserProfile();
  };

  const deleteBeneficiary = async (beneficiaryId: string) => {
    if (!user || !db) throw new Error("User not authenticated or DB not available");
    await deleteBeneficiaryFromDb(user.uid, beneficiaryId, db);
    await refreshUserProfile();
  }

  const requestTransfer = async (transferData: Omit<Transaction, 'id' | 'status' | 'type' | 'date'>) => {
    if (!user || !db) throw new Error("User not authenticated or DB not available");
    await requestTransferInDb(user.uid, transferData, db);
    await refreshUserProfile();
  };

  const value = { 
    user, 
    userProfile, 
    loading, 
    isBalanceVisible,
    toggleBalanceVisibility,
    login, 
    logout, 
    updateUserPassword,
    refreshUserProfile,
    updateUserProfileData,
    requestCard,
    requestVirtualCard,
    // deleteConversation is admin only now
    deleteMessage,
    addBeneficiary,
    deleteBeneficiary,
    requestTransfer
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
