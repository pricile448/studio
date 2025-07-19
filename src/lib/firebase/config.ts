import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Configuration Firebase avec valeurs par défaut (solution temporaire)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA5wfRvUsB_Z7Xv4t-F0IoCa0LMEqB12LI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "amcbunq.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "amcbunq",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "amcbunq.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "466533825569",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:466533825569:web:873294f84a51aee5f63760",
};

// Debug détaillé
console.log("🔥 Firebase Environment Check:", {
  allEnvKeys: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_FIREBASE_')),
  isClient: typeof window !== 'undefined',
  nodeEnv: process.env.NODE_ENV,
});

console.log("🔍 Firebase Config Values:", {
  apiKey: firebaseConfig.apiKey?.substring(0, 15) + "...",
  authDomain: firebaseConfig.authDomain || "MISSING ❌",
  projectId: firebaseConfig.projectId || "MISSING ❌",
  storageBucket: firebaseConfig.storageBucket || "MISSING ❌",
  messagingSenderId: firebaseConfig.messagingSenderId || "MISSING ❌",
  appId: firebaseConfig.appId?.substring(0, 15) + "..." || "MISSING ❌",
});

// Validation
const missingFields = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingFields.length > 0) {
  console.log("🔥 Missing Firebase config fields:", missingFields);
  console.log(`
**************************************************
USING FALLBACK VALUES - Environment variables not loaded!
This is a temporary fix. Please check your NEXT_PUBLIC_FIREBASE_* variables.
Current environment: ${process.env.NODE_ENV}
Available env vars: ${Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_FIREBASE_')).join(', ')}
**************************************************
  `);
}

// Initialize Firebase
let app: FirebaseApp;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  console.log("✅ Firebase initialized successfully");
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
  throw error;
}

// Firebase services avec gestion d'erreur
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

try {
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log("✅ All Firebase services initialized");
} catch (error) {
  console.error("❌ Firebase services initialization failed:", error);
}

// Proxies pour gérer les cas où les services ne sont pas initialisés
const createServiceProxy = (service: any, serviceName: string) => {
  if (!service) {
    return new Proxy({}, {
      get() {
        console.warn(`🚫 ${serviceName} is not initialized. Authentication/database will not work.`);
        return undefined;
      }
    });
  }
  return service;
};

// Export des services avec proxy de sécurité
export { app };
export const authProxy = createServiceProxy(auth, "Firebase Auth");
export const dbProxy = createServiceProxy(db, "Firestore");
export const storageProxy = createServiceProxy(storage, "Firebase Storage");

// Exports principaux (utilisez ces versions)
export { authProxy as auth, dbProxy as db, storageProxy as storage };

// Fonction de diagnostic
export const diagnoseFirebase = () => {
  console.log("🔍 Firebase Diagnosis:", {
    appInitialized: !!app,
    authInitialized: !!auth,
    dbInitialized: !!db,
    storageInitialized: !!storage,
    envVarsFound: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_FIREBASE_')),
    configUsed: firebaseConfig,
  });
};
