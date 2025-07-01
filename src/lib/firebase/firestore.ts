import { doc, setDoc, serverTimestamp, getDoc, updateDoc, Timestamp, collection, addDoc, query, orderBy, onSnapshot, where, getDocs, limit, deleteDoc, Firestore, writeBatch, deleteField } from "firebase/firestore";
import { db as defaultDb } from "./config";

export type Account = {
  id: string;
  name: string;
  balance: number;
  currency: string;
  accountNumber: string;
  status: 'active' | 'suspended';
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

export type VirtualCard = {
  id: string;
  name: string;
  number: string;
  expiry: string; // MM/YY
  cvv: string;
  limit: number;
  isFrozen: boolean;
  createdAt: Timestamp;
  type: 'virtual';
  status: 'active' | 'suspended';
};

export type PhysicalCardType = 'essentielle' | 'precieuse' | 'luminax';

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
  kycDocuments?: {
    idDocumentUrl: string;
    proofOfAddressUrl: string;
    selfieUrl: string;
  };
  cardStatus: 'none' | 'requested' | 'active' | 'suspended';
  cardType?: PhysicalCardType;
  cardRequestedAt?: Date;
  cardLimits?: {
    monthly: number;
    withdrawal: number;
  };
  iban?: string;
  bic?: string;
  accounts: Account[];
  transactions: Transaction[];
  beneficiaries: Beneficiary[];
  budgets: Budget[];
  documents: Document[];
  virtualCards: VirtualCard[];
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
    { id: 'checking-1', name: 'checking', balance: 0, currency: 'EUR', accountNumber: '**** **** **** 1234', status: 'active' },
    { id: 'savings-1', name: 'savings', balance: 0, currency: 'EUR', accountNumber: '**** **** **** 5678', status: 'active' },
    { id: 'credit-1', name: 'credit', balance: 0, currency: 'EUR', accountNumber: '**** **** **** 9010', status: 'active' },
  ];

  const fullProfile: Omit<UserProfile, 'createdAt'> = {
    ...userData,
    kycStatus: 'unverified',
    cardStatus: 'none',
    cardLimits: { monthly: 2000, withdrawal: 500 },
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
    virtualCards: [],
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
    const messagesRef = collection(dbInstance, 'chats', chatId, 'messages');
    
    // Étape 1 : Supprimer tous les messages dans la sous-collection.
    const messagesSnap = await getDocs(messagesRef);
    if (!messagesSnap.empty) {
        const deleteBatch = writeBatch(dbInstance);
        messagesSnap.forEach(doc => {
            deleteBatch.delete(doc.ref);
        });
        await deleteBatch.commit();
    }

    // Étape 2 : Réinitialiser les champs du document de conversation principal
    // au lieu de le supprimer. Cela évite les erreurs de permission côté client.
    await updateDoc(chatRef, {
        lastMessageText: deleteField(),
        lastMessageTimestamp: deleteField(),
        lastMessageSenderId: deleteField()
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
    category: 'AmCBunq Service',
    status: 'completed'
  };
  
  const transactions = userData.transactions ? [...userData.transactions, newTransaction] : [newTransaction];

  await updateDoc(userRef, {
    accounts: accounts,
    transactions: transactions
  });
}

export async function debitFundsFromAccount(userId: string, accountId: string, amount: number, description: string, db: Firestore = defaultDb): Promise<void> {
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
  
  const debitAmount = Math.abs(amount) * -1; // ensure it's a negative value
  accounts[accountIndex].balance += debitAmount;
  
  const newTransaction = {
    id: `txn_${Date.now()}`,
    accountId: accountId,
    date: Timestamp.now(),
    description: description,
    amount: debitAmount,
    currency: 'EUR',
    category: 'AmCBunq Service',
    status: 'completed'
  };
  
  const transactions = userData.transactions ? [...userData.transactions, newTransaction] : [newTransaction];

  await updateDoc(userRef, {
    accounts: accounts,
    transactions: transactions
  });
}

export async function updateUserAccountDetails(userId: string, accountId: string, details: Partial<Account>, db: Firestore = defaultDb): Promise<void> {
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

    accounts[accountIndex] = { ...accounts[accountIndex], ...details };

    await updateDoc(userRef, {
        accounts: accounts
    });
}

export async function resetAccountBalance(userId: string, accountId: string, db: Firestore = defaultDb): Promise<void> {
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
    
    // Set balance to 0
    accounts[accountIndex].balance = 0;

    // Update only the accounts array, without adding a transaction
    await updateDoc(userRef, {
        accounts: accounts
    });
}

export async function deleteTransaction(userId: string, transactionId: string, db: Firestore = defaultDb): Promise<void> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("Utilisateur non trouvé.");
  }

  const userData = userSnap.data();
  const accounts: Account[] = userData.accounts || [];
  // Use a type assertion to work with the data, assuming it's structured like Transaction
  const transactions = userData.transactions || [];

  const transactionIndex = transactions.findIndex((tx: { id: string; }) => tx.id === transactionId);
  if (transactionIndex === -1) {
    throw new Error("Transaction non trouvée.");
  }

  const transactionToDelete = transactions[transactionIndex];
  const accountId = transactionToDelete.accountId;
  const amount = transactionToDelete.amount;

  // Revert the transaction amount from the balance
  const accountIndex = accounts.findIndex(acc => acc.id === accountId);
  if (accountIndex !== -1) {
    accounts[accountIndex].balance -= amount;
  }

  const updatedTransactions = transactions.filter((tx: { id: string; }) => tx.id !== transactionId);

  await updateDoc(userRef, {
    accounts: accounts,
    transactions: updatedTransactions
  });
}

export async function deleteSelectedTransactions(userId: string, transactionIds: string[], db: Firestore = defaultDb): Promise<void> {
  if (transactionIds.length === 0) return;

  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("Utilisateur non trouvé.");
  }

  const userData = userSnap.data();
  let accounts: Account[] = JSON.parse(JSON.stringify(userData.accounts || []));
  let transactions: any[] = userData.transactions || [];
  
  const transactionsToDelete = transactions.filter(tx => transactionIds.includes(tx.id));

  // Revert balances
  for (const tx of transactionsToDelete) {
    const accountIndex = accounts.findIndex(acc => acc.id === tx.accountId);
    if (accountIndex !== -1) {
      accounts[accountIndex].balance -= tx.amount;
    }
  }
  
  const updatedTransactions = transactions.filter(tx => !transactionIds.includes(tx.id));

  await updateDoc(userRef, {
    accounts: accounts,
    transactions: updatedTransactions
  });
}

export async function deleteAllTransactions(userId: string, db: Firestore = defaultDb): Promise<void> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("Utilisateur non trouvé.");
  }

  const userData = userSnap.data();
  let accounts: Account[] = userData.accounts || [];

  // Reset all account balances to 0
  accounts.forEach(acc => acc.balance = 0);

  // Clear all transactions
  await updateDoc(userRef, {
    accounts: accounts,
    transactions: []
  });
}


export async function deleteBudget(userId: string, budgetId: string, db: Firestore = defaultDb): Promise<void> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("Utilisateur non trouvé.");
  }

  const userData = userSnap.data();
  const budgets: Budget[] = userData.budgets || [];
  const updatedBudgets = budgets.filter(b => b.id !== budgetId);

  await updateDoc(userRef, {
    budgets: updatedBudgets
  });
}
