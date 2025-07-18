// 📁 config/firebase.ts
// Configuration Firebase TypeScript robuste

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Configuration Firebase avec types
interface FirebaseConfig {
  apiKey: string | undefined;
  authDomain: string | undefined;
  projectId: string | undefined;
  storageBucket: string | undefined;
  messagingSenderId: string | undefined;
  appId: string | undefined;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Interface pour les services Firebase
interface FirebaseServices {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  storage: FirebaseStorage | null;
  isAvailable: boolean;
}

// Singleton map pour stocker les instances
const appInstances = new Map<string, FirebaseApp | null>();

// Fonction pour vérifier la validité de la configuration
function isFirebaseConfigValid(config: FirebaseConfig): boolean {
  return !!(
    config.apiKey && 
    config.authDomain && 
    config.projectId &&
    config.storageBucket &&
    config.messagingSenderId &&
    config.appId
  );
}

// Fonction pour obtenir les services Firebase
export function getFirebaseServices(appName: string = '[DEFAULT]'): FirebaseServices {
  // Vérifier si l'instance existe déjà
  if (appInstances.has(appName)) {
    const app = appInstances.get(appName);
    if (!app) {
      return { app: null, auth: null, db: null, storage: null, isAvailable: false };
    }
    return {
      app,
      auth: getAuth(app),
      db: getFirestore(app),
      storage: getStorage(app),
      isAvailable: true,
    };
  }
  
  // Vérifier la validité de la configuration
  if (!isFirebaseConfigValid(firebaseConfig)) {
    // Éviter de logger l'erreur pour l'app admin côté client
    if (typeof window !== 'undefined' && appName !== 'admin') {
      console.warn(
        `⚠️ Firebase configuration incomplete for app "${appName}". ` +
        `Some features may be disabled. Check your environment variables.`
      );
    }
    
    // Stocker null pour éviter les tentatives répétées
    appInstances.set(appName, null);
    return { app: null, auth: null, db: null, storage: null, isAvailable: false };
  }

  try {
    // Essayer de récupérer l'app existante ou en créer une nouvelle
    let app: FirebaseApp;
    
    if (appName === '[DEFAULT]') {
      const existingApps = getApps();
      app = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);
    } else {
      app = getApps().find(existingApp => existingApp.name === appName) || 
            initializeApp(firebaseConfig, appName);
    }
    
    // Stocker l'instance
    appInstances.set(appName, app);
    
    return {
      app,
      auth: getAuth(app),
      db: getFirestore(app),
      storage: getStorage(app),
      isAvailable: true,
    };
  } catch (error) {
    console.error(`❌ Erreur lors de l'initialisation Firebase pour "${appName}":`, error);
    appInstances.set(appName, null);
    return { app: null, auth: null, db: null, storage: null, isAvailable: false };
  }
}

// Services par défaut avec gestion sécurisée
const defaultServices = getFirebaseServices();

// Exports avec vérifications de type
export const app = defaultServices.app;
export const auth = defaultServices.auth;
export const db = defaultServices.db;
export const storage = defaultServices.storage;
export const isFirebaseAvailable = defaultServices.isAvailable;

// Fonction utilitaire pour vérifier la disponibilité
export function checkFirebaseAvailability(): boolean {
  return isFirebaseAvailable;
}

// Fonction pour obtenir la configuration actuelle (debug)
export function getFirebaseConfig(): Partial<FirebaseConfig> {
  return {
    apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : undefined,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId ? `${firebaseConfig.appId.substring(0, 20)}...` : undefined,
  };
}

// Type guards pour vérifier les services
export function isAuthAvailable(auth: Auth | null): auth is Auth {
  return auth !== null && isFirebaseAvailable;
}

export function isFirestoreAvailable(db: Firestore | null): db is Firestore {
  return db !== null && isFirebaseAvailable;
}

export function isStorageAvailable(storage: FirebaseStorage | null): storage is FirebaseStorage {
  return storage !== null && isFirebaseAvailable;
}

// 📁 hooks/useFirebase.ts
// Hook React pour utiliser Firebase avec TypeScript

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, isAuthAvailable } from '../config/firebase';

interface UseFirebaseReturn {
  user: User | null;
  loading: boolean;
  isAvailable: boolean;
  error: string | null;
}

export function useFirebase(): UseFirebaseReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier si Firebase Auth est disponible
    if (!isAuthAvailable(auth)) {
      setError('Firebase Auth non disponible');
      setLoading(false);
      return;
    }

    // Écouter les changements d'authentification
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Erreur Firebase Auth:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    isAvailable: isAuthAvailable(auth),
    error,
  };
}

// 📁 services/authService.ts
// Service d'authentification TypeScript

import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  UserCredential
} from "firebase/auth";
import { auth, isAuthAvailable } from "../config/firebase";

class AuthService {
  private checkAvailability(): void {
    if (!isAuthAvailable(auth)) {
      throw new Error('Firebase Auth non disponible. Vérifiez votre configuration.');
    }
  }

  async signIn(email: string, password: string): Promise<UserCredential> {
    this.checkAvailability();
    return signInWithEmailAndPassword(auth!, email, password);
  }

  async signUp(email: string, password: string): Promise<UserCredential> {
    this.checkAvailability();
    return createUserWithEmailAndPassword(auth!, email, password);
  }

  async signOut(): Promise<void> {
    this.checkAvailability();
    return signOut(auth!);
  }

  getCurrentUser(): User | null {
    if (!isAuthAvailable(auth)) {
      return null;
    }
    return auth!.currentUser;
  }

  isAvailable(): boolean {
    return isAuthAvailable(auth);
  }
}

export const authService = new AuthService();

// 📁 services/firestoreService.ts
// Service Firestore TypeScript

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  DocumentReference,
  DocumentSnapshot,
  QuerySnapshot,
  WhereFilterOp,
  DocumentData
} from "firebase/firestore";
import { db, isFirestoreAvailable } from "../config/firebase";

class FirestoreService {
  private checkAvailability(): void {
    if (!isFirestoreAvailable(db)) {
      throw new Error('Firestore non disponible. Vérifiez votre configuration.');
    }
  }

  async addDocument(
    collectionName: string, 
    data: DocumentData
  ): Promise<DocumentReference<DocumentData>> {
    this.checkAvailability();
    return addDoc(collection(db!, collectionName), data);
  }

  async getDocument(
    collectionName: string, 
    docId: string
  ): Promise<DocumentSnapshot<DocumentData>> {
    this.checkAvailability();
    return getDoc(doc(db!, collectionName, docId));
  }

  async getDocuments(
    collectionName: string
  ): Promise<QuerySnapshot<DocumentData>> {
    this.checkAvailability();
    return getDocs(collection(db!, collectionName));
  }

  async updateDocument(
    collectionName: string, 
    docId: string, 
    data: Partial<DocumentData>
  ): Promise<void> {
    this.checkAvailability();
    return updateDoc(doc(db!, collectionName, docId), data);
  }

  async deleteDocument(
    collectionName: string, 
    docId: string
  ): Promise<void> {
    this.checkAvailability();
    return deleteDoc(doc(db!, collectionName, docId));
  }

  async queryDocuments(
    collectionName: string,
    field: string,
    operator: WhereFilterOp,
    value: any
  ): Promise<QuerySnapshot<DocumentData>> {
    this.checkAvailability();
    const q = query(
      collection(db!, collectionName),
      where(field, operator, value)
    );
    return getDocs(q);
  }

  isAvailable(): boolean {
    return isFirestoreAvailable(db);
  }
}

export const firestoreService = new FirestoreService();
