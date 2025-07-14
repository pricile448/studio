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
    return !!(config.apiKey && config.authDomain && config.projectId);
}


export function getFirebaseServices(appName: string = '[DEFAULT]'): FirebaseServices {
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
        console.error(
            `\n**************************************************\n` +
            `ERROR: Firebase client configuration is missing or incomplete.\n` +
            `Please ensure all NEXT_PUBLIC_FIREBASE_* environment variables are set correctly in your .env file.\n` +
            `Client-side Firebase features will be disabled.\n` +
            `**************************************************\n`
        );
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

// Default export for convenience where only one instance is needed (client-side)
const { app, auth, db, storage } = getFirebaseServices();

// Handle the case where initialization might fail
const authInstance = auth as Auth;
const dbInstance = db as Firestore;
const storageInstance = storage as FirebaseStorage;

export { app, authInstance as auth, dbInstance as db, storageInstance as storage };