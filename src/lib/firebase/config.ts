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
const appInstances = new Map<string, FirebaseApp>();

interface FirebaseServices {
    app: FirebaseApp;
    auth: Auth;
    db: Firestore;
    storage: FirebaseStorage;
}

export function getFirebaseServices(appName: string = '[DEFAULT]'): FirebaseServices {
    if (appInstances.has(appName)) {
        const app = appInstances.get(appName)!;
        return {
            app,
            auth: getAuth(app),
            db: getFirestore(app),
            storage: getStorage(app),
        };
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

export { app, auth, db, storage };
