import { doc, setDoc, serverTimestamp, getDoc, updateDoc, Timestamp, collection, addDoc, query, orderBy, onSnapshot, where, getDocs, limit, deleteDoc, Firestore, writeBatch } from "firebase/firestore";
import { db as defaultDb } from "./config";

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
  senderId: string;
  timestamp: Timestamp;
  deletedForUser?: boolean;
  text?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
};

export type Document = {
  id: string;
  name: string;
  url: string;
  createdAt: Timestamp;
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
  inactivityTimeout?: number; // in minutes, 0 for never
  createdAt: Date;
  kycStatus: 'unverified' | 'pending' | 'verified';
  kycSubmittedAt?: Date;
  cardStatus: 'none' | 'requested' | 'active';
  cardRequestedAt?: Date;
  iban?: string;
  bic?: string;
  accounts: Account[];
  transactions: Transaction[];
  beneficiaries: Beneficiary[];
  budgets: Budget[];
  documents: Document[];
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
  const userRef = doc(defaultDb, "users", userData.uid);
  
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
    inactivityTimeout: 5, // Default timeout of 5 minutes
    accounts: defaultAccounts,
    transactions: [],
    beneficiaries: [],
    budgets: [],
    documents: [],
    advisorId: 'advisor_123'
  };

  await setDoc(userRef, {
    ...fullProfile,
    createdAt: serverTimestamp(),
  });
}

export async function getUserFromFirestore(uid: string, db: Firestore = defaultDb): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
        const data = docSnap.data();

        const parseDate = (field: any): Date => {
            if (field && typeof field.toDate === 'function') {
                return field.toDate();
            }
            if (field) {
                const d = new Date(field);
                if (!isNaN(d.getTime())) return d;
            }
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
        const kycSubmittedAt = parseOptionalDate(data.kycSubmittedAt);

        return {
            ...data,
            dob,
            createdAt,
            cardRequestedAt,
            kycSubmittedAt,
            transactions,
        } as UserProfile;

    } else {
        console.log(`Aucun document utilisateur trouvé pour l'UID: ${uid}`);
        return null;
    }
}


export async function updateUserInFirestore(uid: string, data: Partial<Omit<UserProfile, 'uid'>>, db: Firestore = defaultDb) {
  const userRef = doc(db, "users", uid);
  
  const dataToUpdate: { [key: string]: any } = { ...data };
  if (data.dob instanceof Date) {
    dataToUpdate.dob = Timestamp.fromDate(data.dob);
  }
  if (data.cardRequestedAt instanceof Date) {
    dataToUpdate.cardRequestedAt = Timestamp.fromDate(data.cardRequestedAt);
  }
  
  await updateDoc(userRef, dataToUpdate);
}


export async function getOrCreateChatId(userId: string, advisorId: string, db: Firestore = defaultDb): Promise<string> {
    const participants = [userId, advisorId].sort();
    const chatId = participants.join('_');
    const chatRef = doc(db, 'chats', chatId);

    const chatSnap = await getDoc(chatRef);

    if (chatSnap.exists()) {
        return chatSnap.id;
    } else {
        await setDoc(chatRef, {
            participants: participants,
            createdAt: serverTimestamp(),
        });
        return chatId;
    }
}

export async function addMessageToChat(chatId: string, message: Omit<ChatMessage, 'id'>, db: Firestore = defaultDb) {
    const messagesCollection = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesCollection, message);

    const lastMessageText = message.text || `Fichier: ${message.fileName || 'Fichier'}`;

    await updateDoc(doc(db, 'chats', chatId), {
        lastMessageText: lastMessageText,
        lastMessageTimestamp: message.timestamp,
        lastMessageSenderId: message.senderId,
    });
}

export async function softDeleteUserMessage(chatId: string, messageId: string, db: Firestore = defaultDb) {
    const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
    await updateDoc(messageRef, { deletedForUser: true });
}

export async function hardDeleteMessage(chatId: string, messageId: string, db: Firestore = defaultDb) {
    const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
    await deleteDoc(messageRef);
}

export async function deleteChatSession(chatId: string, dbInstance: Firestore = defaultDb) {
    const chatRef = doc(dbInstance, 'chats', chatId);

    // Étape 1 : Récupérer les participants avant la suppression.
    const chatSnap = await getDoc(chatRef);
    const participants = chatSnap.exists() ? chatSnap.data().participants : null;

    if (!participants) {
        console.warn(`Conversation ${chatId} non trouvée. Impossible de réinitialiser.`);
        // Si elle n'existe pas déjà, il n'y a rien à faire.
        return;
    }

    // Étape 2 : Supprimer tous les messages dans la sous-collection.
    const messagesRef = collection(dbInstance, 'chats', chatId, 'messages');
    const messagesQuery = query(messagesRef);
    const messagesSnap = await getDocs(messagesQuery);

    // Utilisation d'un batch pour assurer la suppression atomique des messages.
    const deleteBatch = writeBatch(dbInstance);
    if (!messagesSnap.empty) {
        messagesSnap.forEach(doc => {
            deleteBatch.delete(doc.ref);
        });
    }
    // Valider la suppression des messages avant de continuer.
    await deleteBatch.commit();

    // Étape 3 : Supprimer le document de conversation principal.
    await deleteDoc(chatRef);
    
    // Étape 4 : Le recréer immédiatement avec le même ID et les mêmes participants.
    // Ceci réinitialise la conversation à un état propre.
    await setDoc(chatRef, {
        participants: participants,
        createdAt: serverTimestamp(),
    });
}


export async function getAllUsers(db: Firestore = defaultDb): Promise<UserProfile[]> {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    const usersList = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        const parseDate = (field: any): Date => {
            if (field && typeof field.toDate === 'function') {
                return field.toDate();
            }
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
        return {
            ...data,
            dob: parseDate(data.dob),
            createdAt: parseDate(data.createdAt),
            kycSubmittedAt: parseOptionalDate(data.kycSubmittedAt),
        } as UserProfile;
    });
    return usersList;
}

export async function getPendingKycUsers(db: Firestore = defaultDb): Promise<UserProfile[]> {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where("kycStatus", "==", "pending"));
    
    const querySnapshot = await getDocs(q);
    const usersList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const parseDate = (field: any): Date => {
            if (field && typeof field.toDate === 'function') {
                return field.toDate();
            }
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
        return {
            ...data,
            dob: parseDate(data.dob),
            createdAt: parseDate(data.createdAt),
            kycSubmittedAt: parseOptionalDate(data.kycSubmittedAt),
        } as UserProfile;
    });
    return usersList;
}

export async function addFundsToAccount(userId: string, accountId: string, amount: number, description: string, db: Firestore = defaultDb): Promise<void> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("Utilisateur non trouvé.");
  }

  const userData = userSnap.data();
  
  const accounts: Account[] = userData.accounts || [];
  const accountIndex = accounts.findIndex(acc => acc.id === accountId);

  if (accountIndex === -1) {
    throw new Error("Compte non trouvé.");
  }

  accounts[accountIndex].balance += amount;
  
  const newTransaction = {
    id: `txn_${Date.now()}`,
    accountId: accountId,
    date: Timestamp.now(),
    description: description,
    amount: amount,
    currency: 'EUR',
    category: 'Dépôt Administratif',
    status: 'completed'
  };
  
  const transactions = userData.transactions ? [...userData.transactions, newTransaction] : [newTransaction];

  await updateDoc(userRef, {
    accounts: accounts,
    transactions: transactions
  });
}

export async function generateUserIban(userId: string, db: Firestore = defaultDb): Promise<{iban: string, bic: string}> {
  const userRef = doc(db, "users", userId);
  
  const countryCode = "FR76";
  const bankCode = "30004";
  const branchCode = "00001";
  const accountNumber = Math.floor(10000000000 + Math.random() * 90000000000).toString();
  const key = "85";
  const iban = `${countryCode} ${bankCode} ${branchCode} ${accountNumber} ${key}`;
  const bic = "BNPAFRPPXXX";

  await updateDoc(userRef, {
    iban: iban,
    bic: bic
  });

  return { iban, bic };
}
