import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Vérification explicite des variables d'environnement pour un meilleur débogage
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error("Les variables d'environnement Firebase ne sont pas définies. C'est un problème de configuration, pas un bug. Veuillez suivre ces étapes : 1. Copiez vos clés depuis les paramètres de votre projet Firebase. 2. Collez-les dans le fichier `.env.local` à la racine de votre projet. 3. TRÈS IMPORTANT: Arrêtez et redémarrez le serveur de développement pour que les changements soient pris en compte.");
}


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
