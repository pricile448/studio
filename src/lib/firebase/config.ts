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

// 🔧 AMÉLIORATION : Debug plus détaillé
console.log('🔍 Firebase Environment Check:', {
  nodeEnv: process.env.NODE_ENV,
  isClient: typeof window !== 'undefined',
  allEnvKeys: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_FIREBASE')),
});

console.log('🔍 Firebase Config Values:', {
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'MISSING ❌',
  authDomain: firebaseConfig.authDomain || 'MISSING ❌',
  projectId: firebaseConfig.projectId || 'MISSING ❌',
  storageBucket: firebaseConfig.storageBucket || 'MISSING ❌',
  messagingSenderId: firebaseConfig.messagingSenderId || 'MISSING ❌',
  appId: firebaseConfig.appId ? `${firebaseConfig.appId.substring(0, 15)}...` : 'MISSING ❌',
});

// Singleton map to store initialized app instances
const appInstances = new Map<string, FirebaseApp | null>();

interface FirebaseServices {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  storage: FirebaseStorage | null;
}

// 🔧 AMÉLIORATION : Validation plus robuste
function isFirebaseConfigValid(config: typeof firebaseConfig): boolean {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingFields = requiredFields.filter(field => !config[field as keyof typeof config]);
  
  if (missingFields.length > 0) {
    console.error('🔥 Missing Firebase config fields:', missingFields);
    return false;
  }
  
  return true;
}

export function getFirebaseServices(appName: string = '[DEFAULT]'): FirebaseServices {
  // ✅ Vérifier qu'on est côté client
  if (typeof window === 'undefined') {
    console.log('🏢 Server-side: Returning null Firebase services');
    return { app: null, auth: null, db: null, storage: null };
  }

  // 🔧 AMÉLIORATION : Vérifier le cache d'abord
  if (appInstances.has(appName)) {
    const app = appInstances.get(appName)!;
    if (!app) {
      console.log('📦 Cached null app found');
      return { app: null, auth: null, db: null, storage: null };
    }
    console.log('📦 Using cached Firebase app');
    return {
      app,
      auth: getAuth(app),
      db: getFirestore(app),
      storage: getStorage(app),
    };
  }

  if (!isFirebaseConfigValid(firebaseConfig)) {
    if (appName !== 'admin') {
      console.error(
        `\n**************************************************\n` +
        `ERROR: Firebase client configuration is missing or incomplete.\n` +
        `Please ensure all NEXT_PUBLIC_FIREBASE_* environment variables are set correctly.\n` +
        `Current environment: ${process.env.NODE_ENV}\n` +
        `Available env vars: ${Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_FIREBASE')).join(', ')}\n` +
        `Client-side Firebase features will be disabled.\n` +
        `**************************************************\n`
      );
    }
    appInstances.set(appName, null);
    return { app: null, auth: null, db: null, storage: null };
  }

  try {
    // 🔧 AMÉLIORATION : Meilleure gestion des apps existantes
    let app: FirebaseApp;
    const existingApp = getApps().find(app => app.name === appName);
    
    if (existingApp) {
      console.log('♻️ Using existing Firebase app');
      app = existingApp;
    } else {
      console.log('🚀 Initializing new Firebase app');
      app = initializeApp(firebaseConfig, appName);
    }
    
    appInstances.set(appName, app);
    
    const services = {
      app,
      auth: getAuth(app),
      db: getFirestore(app),
      storage: getStorage(app),
    };
    
    console.log('✅ Firebase services initialized successfully');
    return services;
    
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error);
    appInstances.set(appName, null);
    return { app: null, auth: null, db: null, storage: null };
  }
}

// 🔧 AMÉLIORATION : Simplification des exports avec gestion d'erreur
let _services: FirebaseServices | null = null;

function getServices(): FirebaseServices {
  if (!_services) {
    _services = getFirebaseServices();
  }
  return _services;
}

// 🔧 AMÉLIORATION : Exports plus simples et plus fiables
export const app = new Proxy({} as FirebaseApp, {
  get(target, prop) {
    const services = getServices();
    if (!services.app) {
      console.warn('⚠️ Firebase app not initialized, returning null');
      return null;
    }
    return (services.app as any)[prop];
  }
});

export const auth = new Proxy({} as Auth, {
  get(target, prop) {
    const services = getServices();
    if (!services.auth) {
      console.warn('⚠️ Firebase auth not initialized, returning null');
      return null;
    }
    return (services.auth as any)[prop];
  }
});

export const db = new Proxy({} as Firestore, {
  get(target, prop) {
    const services = getServices();
    if (!services.db) {
      console.warn('⚠️ Firebase db not initialized, returning null');
      return null;
    }
    return (services.db as any)[prop];
  }
});

export const storage = new Proxy({} as FirebaseStorage, {
  get(target, prop) {
    const services = getServices();
    if (!services.storage) {
      console.warn('⚠️ Firebase storage not initialized, returning null');
      return null;
    }
    return (services.storage as any)[prop];
  }
});

// ✅ Fonction d'initialisation explicite
export function initializeFirebase(): FirebaseServices {
  console.log('🔄 Explicit Firebase initialization called');
  if (typeof window !== 'undefined') {
    _services = null; // Reset cache
    return getFirebaseServices();
  }
  console.log('🏢 Server-side: Cannot initialize Firebase');
  return { app: null, auth: null, db: null, storage: null };
}

// 🔧 AJOUT : Fonction de diagnostic
export function diagnoseFirebase(): void {
  console.log('🔍 Firebase Diagnosis:');
  console.log('- Environment:', process.env.NODE_ENV);
  console.log('- Client-side:', typeof window !== 'undefined');
  console.log('- Config valid:', isFirebaseConfigValid(firebaseConfig));
  console.log('- Apps initialized:', getApps().length);
  console.log('- Services cached:', _services !== null);
}
