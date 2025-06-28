
import { doc, setDoc, serverTimestamp, getDoc, updateDoc, Timestamp, collection, addDoc, query, orderBy, onSnapshot, where, getDocs, limit } from "firebase/firestore";
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

export type ChatMessage = {
  id?: string;
  text: string;
  senderId: string;
  timestamp: Timestamp;
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
  advisorId?: string;
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
    budgets: [],
    advisorId: 'advisor_123'
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

        // This is a robust way to parse dates that might be Timestamps or something else.
        const parseDate = (field: any): Date => {
            if (field && typeof field.toDate === 'function') { // Check if it's a Firestore Timestamp
                return field.toDate();
            }
            if (field) { // Try to parse it if it's a string or number
                const d = new Date(field);
                if (!isNaN(d.getTime())) return d;
            }
            // Fallback for missing or invalid dates
            return new Date(); 
        };
        
        const parseOptionalDate = (field: any): Date | undefined => {
            if (!field) return undefined;
             if (field && typeof field.toDate === 'function') {
                return field.toDate();
            }
             if (field) {
                const d = new Date(field);
                if (!isNaN(d.getTime())) return d;
            }
            return undefined;
        };
        
        const transactions = (data.transactions || []).map((tx: any) => ({
            ...tx,
            date: parseDate(tx.date)
        }));

        const dob = parseDate(data.dob);
        const createdAt = parseDate(data.createdAt);
        const cardRequestedAt = parseOptionalDate(data.cardRequestedAt);

        return {
            ...data,
            dob,
            createdAt,
            cardRequestedAt,
            transactions,
        } as UserProfile;

    } else {
        console.log(`Aucun document utilisateur trouvé pour l'UID: ${uid}`);
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


export async function getOrCreateChatId(userId: string, advisorId: string): Promise<string> {
    // Créer un ID de chat déterministe en triant les ID des participants
    // pour garantir que l'ID est toujours le même, quel que soit l'ordre.
    const participants = [userId, advisorId].sort();
    const chatId = participants.join('_');
    const chatRef = doc(db, 'chats', chatId);

    const chatSnap = await getDoc(chatRef);

    if (chatSnap.exists()) {
        // La conversation existe déjà, on retourne son ID.
        return chatSnap.id;
    } else {
        // La conversation n'existe pas, on la crée.
        await setDoc(chatRef, {
            participants: participants, // On stocke les participants triés
            createdAt: serverTimestamp(),
        });
        return chatId;
    }
}

export async function addMessageToChat(chatId: string, message: Omit<ChatMessage, 'id'>) {
    const messagesCollection = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesCollection, message);
    await updateDoc(doc(db, 'chats', chatId), {
        lastMessageText: message.text,
        lastMessageTimestamp: message.timestamp,
        lastMessageSenderId: message.senderId,
    });
}
