
import { doc, setDoc, serverTimestamp, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./config";

export type Account = {
  id: string;
  name: string;
  balance: number;
  currency: string;
  accountNumber: string;
};

export type Transaction = {
  id: string;
  accountId: string;
  date: any; // Firestore Timestamp
  description: string;
  amount: number;
  category: string;
  status: 'completed' | 'pending' | 'failed';
};

export type Beneficiary = {
  id: string;
  name: string;
  iban: string;
  bic?: string;
};

export type Budget = {
    id: string;
    name: string;
    category: string;
    total: number;
};

export type UserProfile = {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dob: Date;
  pob: string;
  nationality: string;
  residenceCountry: string;
  address: string;
  city: string;
  postalCode: string;
  profession: string;
  salary: number;
  photoURL?: string;
  notificationPrefs?: {
    email: boolean;
    promotions: boolean;
    security: boolean;
  };
  createdAt: any;
  kycStatus: 'unverified' | 'pending' | 'verified';
  cardStatus: 'none' | 'requested' | 'active';
  cardRequestedAt?: any;
  iban?: string;
  bic?: string;
  accounts: Account[];
  transactions: Transaction[];
  beneficiaries: Beneficiary[];
  budgets: Budget[];
};

export async function addUserToFirestore(userProfile: Omit<UserProfile, 'createdAt' | 'kycStatus' | 'cardStatus' | 'accounts' | 'transactions' | 'beneficiaries' | 'budgets'>) {
  const userRef = doc(db, "users", userProfile.uid);
  
  const defaultAccounts: Account[] = [
    { id: 'checking-1', name: 'checking', balance: 0, currency: 'EUR', accountNumber: '**** **** **** 1234' },
    { id: 'savings-1', name: 'savings', balance: 0, currency: 'EUR', accountNumber: '**** **** **** 5678' },
    { id: 'credit-1', name: 'credit', balance: 0, currency: 'EUR', accountNumber: '**** **** **** 9010' },
  ];

  await setDoc(userRef, {
    ...userProfile,
    createdAt: serverTimestamp(),
    kycStatus: 'unverified',
    cardStatus: 'none',
    notificationPrefs: {
        email: true,
        promotions: false,
        security: true,
    },
    accounts: defaultAccounts,
    transactions: [],
    beneficiaries: [],
    budgets: []
  });
}

export async function getUserFromFirestore(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        // Firestore timestamps need to be converted to JS Date objects
        return {
            ...data,
            dob: data.dob?.toDate(),
            createdAt: data.createdAt?.toDate(),
            cardRequestedAt: data.cardRequestedAt?.toDate(),
        } as UserProfile;
    } else {
        return null;
    }
}

export async function updateUserInFirestore(uid: string, data: Partial<Omit<UserProfile, 'uid'>>) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, data);
}
