'use client';

import * as React from 'react';
import { useAuth } from './auth-context';
import { updateProfile } from 'firebase/auth';
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
import { getFirebaseServices } from '@/lib/firebase/config';
import { serverTimestamp, deleteField } from 'firebase/firestore';

const { db } = getFirebaseServices();

type UserProfileContextType = {
  userProfile: UserProfile | null;
  loading: boolean;
  isBalanceVisible: boolean;
  toggleBalanceVisibility: () => void;
  refreshUserProfile: () => Promise<void>;
  updateUserProfileData: (data: Partial<UserProfile>) => Promise<void>;
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
        // Always start loading when a fetch is initiated
        setProfileLoading(true);
        try {
            const profile = await getUserFromFirestore(uid);
            setUserProfile(profile);
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
            setUserProfile(null); // Ensure profile is null on error
        } finally {
            setProfileLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (user) {
            fetchUserProfile(user.uid);
        } else if (!authLoading) {
            // If there's no user and auth is not loading, we are done.
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

        if (Object.keys(authProfileUpdate).length > 0 && auth.currentUser) {
            await updateProfile(auth.currentUser, authProfileUpdate);
        }
        
        await refreshUserProfile();
    }
    
    const requestCard = async (cardType: PhysicalCardType) => {
        if (!user) throw new Error("No user is signed in.");

        const requestData: Partial<UserProfile> = {
            cardStatus: 'requested',
            cardRequestedAt: serverTimestamp() as any, // Cast to any to satisfy type temporarily
            cardType,
        };
        
        await updateUserInFirestore(user.uid, requestData);
        await refreshUserProfile();
    };

    const requestVirtualCard = async () => {
        if (!user) throw new Error("No user is signed in.");
        await updateUserInFirestore(user.uid, { 
            hasPendingVirtualCardRequest: true,
            virtualCardRequestedAt: serverTimestamp() as any,
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
