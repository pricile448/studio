import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Singleton map to store initialized app instances
const appInstances = new Map<string, FirebaseApp | null>();

interface FirebaseServices {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  storage: FirebaseStorage | null;
}

// Function to check if all necessary config values are present
function isFirebaseConfigValid(config: typeof firebaseConfig): boolean {
  // Ajout de debug temporaire
  console.log('🔍 Debug Firebase config:', {
    apiKey: config.apiKey ? 'SET ✅' : 'MISSING ❌',
    authDomain: config.authDomain ? 'SET ✅' : 'MISSING ❌', 
    projectId: config.projectId ? 'SET ✅' : 'MISSING ❌',
    storageBucket: config.storageBucket ? 'SET ✅' : 'MISSING ❌',
    messagingSenderId: config.messagingSenderId ? 'SET ✅' : 'MISSING ❌',
    appId: config.appId ? 'SET ✅' : 'MISSING ❌',
  });
  
  return !!(config.apiKey && config.authDomain && config.projectId);
}

export function getFirebaseServices(appName: string = '[DEFAULT]'): FirebaseServices {
  // ✅ AJOUT : Vérifier qu'on est côté client
  if (typeof window === 'undefined') {
    return { app: null, auth: null, db: null, storage: null };
  }

  if (appInstances.has(appName)) {
    const app = appInstances.get(appName)!;
    if (!app) {
      return { app: null, auth: null, db: null, storage: null };
    }
    return {
      app,
      auth: getAuth(app),
      db: getFirestore(app),
      storage: getStorage(app),
    };
  }

  if (!isFirebaseConfigValid(firebaseConfig)) {
    // Avoid logging this error for the admin app on the client-side
    if (appName !== 'admin') {
      console.error(
        `\n**************************************************\n` +
        `ERROR: Firebase client configuration is missing or incomplete.\n` +
        `Please ensure all NEXT_PUBLIC_FIREBASE_* environment variables are set correctly in your .env file.\n` +
        `Client-side Firebase features will be disabled.\n` +
        `**************************************************\n`
      );
    }
    appInstances.set(appName, null);
    return { app: null, auth: null, db: null, storage: null };
  }

  const app = getApps().find(app => app.name === appName) || initializeApp(firebaseConfig, appName);
  appInstances.set(appName, app);
  
  return {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
    storage: getStorage(app),
  };
}

// ✅ MODIFICATION : Exports lazy pour éviter l'exécution pendant le build
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

export const app = new Proxy({} as FirebaseApp, {
  get(target, prop) {
    if (!_app) {
      const services = getFirebaseServices();
      _app = services.app;
    }
    return _app ? (_app as any)[prop] : null;
  }
});

export const auth = new Proxy({} as Auth, {
  get(target, prop) {
    if (!_auth) {
      const services = getFirebaseServices();
      _auth = services.auth;
    }
    return _auth ? (_auth as any)[prop] : null;
  }
});

export const db = new Proxy({} as Firestore, {
  get(target, prop) {
    if (!_db) {
      const services = getFirebaseServices();
      _db = services.db;
    }
    return _db ? (_db as any)[prop] : null;
  }
});

export const storage = new Proxy({} as FirebaseStorage, {
  get(target, prop) {
    if (!_storage) {
      const services = getFirebaseServices();
      _storage = services.storage;
    }
    return _storage ? (_storage as any)[prop] : null;
  }
});

// ✅ AJOUT : Fonction d'initialisation explicite (optionnelle)
export function initializeFirebase() {
  if (typeof window !== 'undefined') {
    return getFirebaseServices();
  }
  return { app: null, auth: null, db: null, storage: null };
}
