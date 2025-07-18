// Configuration Firebase uniquement - AUCUN hook React ici
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Vérifier si la configuration est complète
const isConfigComplete = Object.values(firebaseConfig).every(value => value !== undefined);

if (!isConfigComplete) {
  // Éviter de logger cette erreur pour l'app admin côté client
  if (typeof window !== 'undefined') {
    console.error(
      "\n**************************************************\n" +
      "ERROR: Firebase client configuration is missing or incomplete.\n" +
      "Please ensure all NEXT_PUBLIC_FIREBASE_* environment variables are set correctly in your .env file.\n" +
      "Client-side Firebase features will be disabled.\n" +
      "**************************************************"
    );
  }
}

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser les services Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);

// Vérifier si l'auth est disponible (pour la compatibilité SSR)
export const isAuthAvailable = typeof window !== 'undefined';
