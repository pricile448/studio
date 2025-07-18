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
  status: 'completed' | 'pending' | 'failed' | 'in_progress' | 'in_review';
  type: 'debit' | 'credit' | 'internal_transfer' | 'outgoing_transfer';
  beneficiaryId?: string;
  beneficiaryName?: string;
  updatedAt?: Timestamp;
};

export type Beneficiary = {
  id: string;
  name: string;
  iban: string;
  bic?: string;
  nickname?: string;
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
  frozenBy?: 'user' | 'admin' | null;
  isDetailsVisibleToUser?: boolean;
  createdAt: Timestamp;
  type: 'virtual';
};

export type PhysicalCardType = 'essentielle' | 'precieuse' | 'luminax';

export type PhysicalCard = {
  type: PhysicalCardType;
  number: string;
  expiry: string;
  cvv: string;
  pin: string;
  isPinVisibleToUser: boolean;
  suspendedBy?: 'user' | 'admin' | null;
};

export type BillingConfig = {
  isEnabled: boolean;
  holder: string;
  iban: string;
  bic: string;
  description: string;
};

export type KycSubmission = {
    uid: string;
    userName: string;
    userEmail: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: Date;
    processedAt?: Date;
    documents: {
        idDocumentUrl: string;
        proofOfAddressUrl: string;
        selfieUrl: string;
    };
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
  role?: string;
  lastLogin?: Date;
  notificationPrefs?: {
    email: boolean;
    promotions: boolean;
    security: boolean;
  };
  inactivityTimeout?: number; // in minutes, 0 for never
  createdAt: Date;
  lastSignInTime?: Date;
  kycStatus: 'unverified' | 'pending' | 'verified';
  kycSubmittedAt?: Date;
  kycDocuments?: {
    idDocumentUrl: string;
    proofOfAddressUrl: string;
    selfieUrl: string;
  };
  emailVerificationCode?: string;
  emailVerificationCodeExpires?: Timestamp;
  cardStatus: 'none' | 'requested' | 'active' | 'suspended' | 'cancelled';
  physicalCard?: PhysicalCard;
  cardType?: PhysicalCardType;
  cardRequestedAt?: Date;
  cardLimits?: {
    monthly: number;
    withdrawal: number;
  };
  hasPendingVirtualCardRequest?: boolean;
  virtualCardRequestedAt?: Date;
  // User's own IBAN details
  iban?: string;
  bic?: string;
  // Bank's billing details to show to the user
  billingText?: string;
  billingHolder?: string;
  billingIban?: string;
  billingBic?: string;
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


export async function getUserFromFirestore(uid: string, db: Firestore = defaultDb): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
        const data = docSnap.data();

        const submissionRef = doc(db, 'kycSubmissions', uid);
        const submissionSnap = await getDoc(submissionRef);
        if (submissionSnap.exists() && submissionSnap.data().status === 'pending') {
            data.kycStatus = 'pending';
        }

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
        const lastSignInTime = parseOptionalDate(data.lastSignInTime);
        const cardRequestedAt = parseOptionalDate(data.cardRequestedAt);
        const kycSubmittedAt = parseOptionalDate(submissionSnap.exists() ? submissionSnap.data().submittedAt : data.kycSubmittedAt);
        const virtualCardRequestedAt = parseOptionalDate(data.virtualCardRequestedAt);


        return {
            ...data,
            dob,
            createdAt,
            lastSignInTime,
            cardRequestedAt,
            kycSubmittedAt,
            virtualCardRequestedAt,
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
  if (data.virtualCardRequestedAt instanceof Date) {
    dataToUpdate.virtualCardRequestedAt = Timestamp.fromDate(data.virtualCardRequestedAt);
  }
  if (data.lastSignInTime instanceof Date) {
    dataToUpdate.lastSignInTime = Timestamp.fromDate(data.lastSignInTime);
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

export async function hardDeleteMessage(chatId: string, messageId: string, db: Firestore) {
    const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
    await deleteDoc(messageRef);
}

export async function deleteChatSession(chatId: string, dbInstance: Firestore) {
    const chatRef = doc(dbInstance, 'chats', chatId);
    const messagesRef = collection(dbInstance, 'chats', chatId, 'messages');
    
    // Delete all messages in the subcollection first.
    const messagesSnap = await getDocs(messagesRef);
    if (!messagesSnap.empty) {
        const deleteBatch = writeBatch(dbInstance);
        messagesSnap.forEach(doc => {
            deleteBatch.delete(doc.ref);
        });
        await deleteBatch.commit();
    }

    // Now, delete the parent chat document itself to ensure a clean state.
    // This prevents "zombie" chat sessions that cause permission errors.
    await deleteDoc(chatRef);
}


export async function getAllUsers(db: Firestore): Promise<UserProfile[]> {
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
            lastSignInTime: parseOptionalDate(data.lastSignInTime),
            kycSubmittedAt: parseOptionalDate(data.kycSubmittedAt),
        } as UserProfile;
    });
    return usersList;
}

export async function getAdmins(db: Firestore): Promise<UserProfile[]> {
    const adminsCol = collection(db, 'admins');
    const adminSnap = await getDocs(adminsCol);
    const adminIds = adminSnap.docs.map(doc => doc.id);

    const adminProfiles: UserProfile[] = [];
    for (const id of adminIds) {
        const userProfile = await getUserFromFirestore(id, db);
        if (userProfile) {
            adminProfiles.push(userProfile);
        }
    }
    return adminProfiles;
}

export async function getAllKycSubmissions(db: Firestore): Promise<KycSubmission[]> {
    const submissionsCollection = collection(db, 'kycSubmissions');
    const q = query(submissionsCollection, orderBy('submittedAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const requestsList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            uid: data.userId, 
            userName: data.userName,
            userEmail: data.userEmail,
            status: data.status,
            submittedAt: data.submittedAt.toDate(),
            processedAt: data.processedAt ? data.processedAt.toDate() : undefined,
            documents: data.documents
        } as KycSubmission;
    });
    return requestsList;
}


export async function addFundsToAccount(userId: string, accountId: string, amount: number, description: string, db: Firestore): Promise<void> {
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

export async function debitFundsFromAccount(userId: string, accountId: string, amount: number, description: string, db: Firestore): Promise<void> {
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

export async function updateUserAccountDetails(userId: string, accountId: string, details: Partial<Account>, db: Firestore): Promise<void> {
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

export async function resetAccountBalance(userId: string, accountId: string, db: Firestore): Promise<void> {
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
    
    accounts[accountIndex].balance = 0;

    await updateDoc(userRef, {
        accounts: accounts
    });
}

export async function deleteTransaction(userId: string, transactionId: string, db: Firestore): Promise<void> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("Utilisateur non trouvé.");
  }

  const userData = userSnap.data();
  const accounts: Account[] = userData.accounts || [];
  const transactions = userData.transactions || [];

  const transactionIndex = transactions.findIndex((tx: { id: string; }) => tx.id === transactionId);
  if (transactionIndex === -1) {
    throw new Error("Transaction non trouvée.");
  }

  const transactionToDelete = transactions[transactionIndex];
  const accountId = transactionToDelete.accountId;
  const amount = transactionToDelete.amount;

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

export async function deleteSelectedTransactions(userId: string, transactionIds: string[], db: Firestore): Promise<void> {
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

export async function deleteAllTransactions(userId: string, db: Firestore): Promise<void> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("Utilisateur non trouvé.");
  }

  const userData = userSnap.data();
  let accounts: Account[] = userData.accounts || [];

  accounts.forEach(acc => acc.balance = 0);

  await updateDoc(userRef, {
    accounts: accounts,
    transactions: []
  });
}


export async function deleteBudget(userId: string, budgetId: string, db: Firestore): Promise<void> {
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

export async function addBeneficiary(userId: string, beneficiaryData: Omit<Beneficiary, 'id'>, db: Firestore = defaultDb): Promise<void> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("Utilisateur non trouvé.");
  }

  const newBeneficiary: Beneficiary = {
    id: `beneficiary_${Date.now()}`,
    ...beneficiaryData
  };

  const currentBeneficiaries = userSnap.data().beneficiaries || [];
  const updatedBeneficiaries = [...currentBeneficiaries, newBeneficiary];

  await updateDoc(userRef, {
    beneficiaries: updatedBeneficiaries
  });
}

export async function deleteBeneficiary(userId: string, beneficiaryId: string, db: Firestore = defaultDb): Promise<void> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("Utilisateur non trouvé.");
  }

  const currentBeneficiaries = userSnap.data().beneficiaries || [];
  const updatedBeneficiaries = currentBeneficiaries.filter((b: Beneficiary) => b.id !== beneficiaryId);

  if (currentBeneficiaries.length === updatedBeneficiaries.length) {
      console.warn(`Beneficiary with id ${beneficiaryId} not found for user ${userId}. No changes made.`);
      return;
  }

  await updateDoc(userRef, {
    beneficiaries: updatedBeneficiaries
  });
}

export async function requestTransfer(userId: string, transferData: Omit<Transaction, 'id' | 'status' | 'type' | 'date'>, db: Firestore = defaultDb): Promise<void> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("Utilisateur non trouvé.");
  }
  
  const userData = userSnap.data();
  const fromAccount = (userData.accounts as Account[]).find(acc => acc.id === transferData.accountId);
  
  if (!fromAccount) {
    throw new Error("Le compte de départ est introuvable.");
  }

  const pendingOutgoingTransfers = (userData.transactions || []).filter(
    (tx: any) =>
      tx.type === 'outgoing_transfer' &&
      ['pending', 'in_progress', 'in_review'].includes(tx.status)
  );

  const pendingAmount = pendingOutgoingTransfers.reduce(
    (sum: number, tx: any) => sum + Math.abs(tx.amount),
    0
  );

  const availableBalance = fromAccount.balance - pendingAmount;

  if (availableBalance < transferData.amount) {
      throw new Error("Solde insuffisant pour effectuer cette opération, en tenant compte des virements déjà en cours.");
  }

  const newTransaction: Omit<Transaction, 'id'> = {
    ...transferData,
    amount: -Math.abs(transferData.amount), // Outgoing transfers are debits
    status: 'pending',
    type: 'outgoing_transfer',
    date: new Date() // Utiliser Date au lieu de Timestamp
  };

  const currentTransactions = userData.transactions || [];
  const updatedTransactions = [...currentTransactions, { ...newTransaction, id: `txn_out_${Date.now()}` }];
  
  await updateDoc(userRef, {
    transactions: updatedTransactions
  });
}

export async function getAllTransfers(db: Firestore): Promise<Array<Transaction & { userId: string, userName: string }>> {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const allTransfers: Array<Transaction & { userId: string, userName: string }> = [];

    usersSnapshot.forEach(userDoc => {
        const userData = userDoc.data();
        if (userData.transactions && userData.transactions.length > 0) {
            const userTransfers = userData.transactions
                .filter((tx: any) => tx.type === 'outgoing_transfer')
                .map((tx: any) => ({
                    ...tx,
                    date: tx.date.toDate(),
                    userId: userDoc.id,
                    userName: `${userData.firstName} ${userData.lastName}`
                }));
            allTransfers.push(...userTransfers);
        }
    });

    return allTransfers;
}

export async function updateTransferStatus(userId: string, transactionId: string, newStatus: 'in_progress' | 'failed' | 'in_review', db: Firestore): Promise<void> {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error("Utilisateur non trouvé.");

    const userData = userSnap.data();
    const transactions: any[] = userData.transactions || [];
    const transactionIndex = transactions.findIndex(tx => tx.id === transactionId);

    if (transactionIndex === -1) throw new Error("Transaction non trouvée.");
    
    transactions[transactionIndex].status = newStatus;
    transactions[transactionIndex].updatedAt = Timestamp.now();

    await updateDoc(userRef, { transactions });
}

export async function executeTransfer(userId: string, transactionId: string, db: Firestore): Promise<void> {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error("Utilisateur non trouvé.");

    const userData = userSnap.data();
    const transactions: any[] = userData.transactions || [];
    const accounts: Account[] = userData.accounts || [];

    const transactionIndex = transactions.findIndex(tx => tx.id === transactionId);
    if (transactionIndex === -1) throw new Error("Transaction non trouvée.");

    const transfer = transactions[transactionIndex];
    if (transfer.status !== 'in_progress') throw new Error("Le virement n'est pas en cours de traitement.");

    const accountIndex = accounts.findIndex(acc => acc.id === transfer.accountId);
    if (accountIndex === -1) throw new Error("Compte de l'utilisateur non trouvé.");

    if (accounts[accountIndex].balance < Math.abs(transfer.amount)) throw new Error("Solde insuffisant.");

    accounts[accountIndex].balance += transfer.amount;

    transactions[transactionIndex].status = 'completed';
    transactions[transactionIndex].updatedAt = Timestamp.now();

    await updateDoc(userRef, { accounts, transactions });
}

export async function getBillingConfig(db: Firestore): Promise<BillingConfig | null> {
  const configRef = doc(db, "config", "billing");
  const docSnap = await getDoc(configRef);
  if (docSnap.exists()) {
    return docSnap.data() as BillingConfig;
  }
  return null;
}

export async function updateBillingConfig(config: BillingConfig, db: Firestore): Promise<void> {
  const configRef = doc(db, "config", "billing");
  await setDoc(configRef, config, { merge: true });
}



