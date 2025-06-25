
import { doc, setDoc, serverTimestamp, getDoc, updateDoc, Timestamp } from "firebase/firestore";
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
  date: Date; // Use JS Date object in the application
  description: string;
  amount: number;
  currency: string;
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
  createdAt: Date;
  kycStatus: 'unverified' | 'pending' | 'verified';
  cardStatus: 'none' | 'requested' | 'active';
  cardRequestedAt?: Date;
  iban?: string;
  bic?: string;
  accounts: Account[];
  transactions: Transaction[];
  beneficiaries: Beneficiary[];
  budgets: Budget[];
};

export type RegistrationData = {
    firstName: string;
    lastName: string;
    email: string;
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
};


export async function addUserToFirestore(userData: RegistrationData & { uid: string }) {
  const userRef = doc(db, "users", userData.uid);
  
  const defaultAccounts: Account[] = [
    { id: 'checking-1', name: 'checking', balance: 0, currency: 'EUR', accountNumber: '**** **** **** 1234' },
    { id: 'savings-1', name: 'savings', balance: 0, currency: 'EUR', accountNumber: '**** **** **** 5678' },
    { id: 'credit-1', name: 'credit', balance: 0, currency: 'EUR', accountNumber: '**** **** **** 9010' },
  ];

  const fullProfile: Omit<UserProfile, 'createdAt'> = {
    ...userData,
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
  };

  await setDoc(userRef, {
    ...fullProfile,
    createdAt: serverTimestamp(),
  });
}

export async function getUserFromFirestore(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        
        const transactions = (data.transactions || []).map((tx: any) => ({
            ...tx,
            date: tx.date instanceof Timestamp ? tx.date.toDate() : new Date(tx.date)
        }));

        return {
            ...data,
            dob: data.dob instanceof Timestamp ? data.dob.toDate() : new Date(data.dob),
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
            cardRequestedAt: data.cardRequestedAt instanceof Timestamp ? data.cardRequestedAt.toDate() : (data.cardRequestedAt ? new Date(data.cardRequestedAt) : undefined),
            transactions,
        } as UserProfile;
    } else {
        return null;
    }
}

export async function updateUserInFirestore(uid: string, data: Partial<Omit<UserProfile, 'uid'>>) {
  const userRef = doc(db, "users", uid);
  
  // Convert JS Date objects back to Firestore Timestamps if they exist
  const dataToUpdate = { ...data };
  if (data.dob instanceof Date) {
    dataToUpdate.dob = Timestamp.fromDate(data.dob);
  }
  if (data.cardRequestedAt instanceof Date) {
    dataToUpdate.cardRequestedAt = Timestamp.fromDate(data.cardRequestedAt);
  }
  
  await updateDoc(userRef, dataToUpdate);
}
