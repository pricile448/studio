
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "./config";

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
};

export async function addUserToFirestore(userProfile: Omit<UserProfile, 'createdAt' | 'kycStatus' | 'cardStatus'>) {
  const userRef = doc(db, "users", userProfile.uid);
  await setDoc(userRef, {
    ...userProfile,
    createdAt: serverTimestamp(),
    kycStatus: 'unverified',
    cardStatus: 'none',
    notificationPrefs: { // Default notification settings
        email: true,
        promotions: false,
        security: true,
    }
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
  await setDoc(userRef, data, { merge: true });
}
