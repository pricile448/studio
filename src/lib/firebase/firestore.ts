
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "./config";

export type UserProfile = {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  dob: Date;
  pob: string;
  nationality: string;
  residenceCountry: string;
  address: string;
  profession: string;
  salary: number;
  createdAt: any;
};

export async function addUserToFirestore(userProfile: Omit<UserProfile, 'createdAt'>) {
  const userRef = doc(db, "users", userProfile.uid);
  await setDoc(userRef, {
    ...userProfile,
    createdAt: serverTimestamp(),
  });
}

export async function getUserFromFirestore(uid: string) {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
    } else {
        return null;
    }
}
