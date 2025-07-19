// Import des fonctions Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuration Firebase avec fallback
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA5wf...", // Remplacez par votre vraie clé
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "amcbunq.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "amcbunq",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "amcbunq.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "466533825569",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "466533825569:we..." // Remplacez par votre vraie app ID
};

// Diagnostic des variables d'environnement
console.log("🔍 Firebase Environment Check:", {
  allEnvKeys: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_FIREBASE')),
  isClient: typeof window !== 'undefined',
  nodeEnv: process.env.NODE_ENV
});

// Diagnostic de la configuration
console.log("🔍 Firebase Config Values:", {
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : "MISSING ❌",
  authDomain: firebaseConfig.authDomain || "MISSING ❌",
  projectId: firebaseConfig.projectId || "MISSING ❌",
  storageBucket: firebaseConfig.storageBucket || "MISSING ❌",
  messagingSenderId: firebaseConfig.messagingSenderId || "MISSING ❌",
  appId: firebaseConfig.appId ? `${firebaseConfig.appId.substring(0, 10)}...` : "MISSING ❌"
});

// Vérification si on utilise les valeurs par défaut
const usingFallback = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
if (usingFallback) {
  console.warn("⚠️ USING FALLBACK VALUES - Variables d'environnement non détectées");
} else {
  console.log("✅ Variables d'environnement détectées");
}

// Initialisation de l'app Firebase
const app = initializeApp(firebaseConfig);

// Services Firebase
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Création des proxys pour le diagnostic
function createServiceProxy(service: any, serviceName: string) {
  return new Proxy(service, {
    get(target, prop) {
      const value = target[prop];
      if (typeof value === 'function') {
        return function(...args: any[]) {
          console.log(`📡 ${serviceName} - Méthode appelée:`, prop);
          return value.apply(target, args);
        };
      }
      return value;
    }
  });
}

// Proxys avec diagnostic
const authProxy = createServiceProxy(auth, "Firebase Auth");
const dbProxy = createServiceProxy(db, "Firebase Firestore");
const storageProxy = createServiceProxy(storage, "Firebase Storage");

// Exports principaux
export { authProxy as auth };
export { dbProxy as db };
export { storageProxy as storage };
export { app };

// Fonction de diagnostic
export const diagnoseFirebase = () => {
  return {
    config: firebaseConfig,
    envVars: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_FIREBASE')),
    usingFallback,
    isClient: typeof window !== 'undefined'
  };
};

// Export de la fonction getFirebaseServices pour la compatibilité
export const getFirebaseServices = () => {
  return {
    auth,
    db,
    storage,
    app
  };
};
