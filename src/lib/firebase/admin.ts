// src/lib/firebase/admin.ts
import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

let adminApp: admin.app.App;

if (admin.apps.length > 0) {
  adminApp = admin.app();
} else {
  const serviceAccountString = process.env.SERVICE_ACCOUNT_JSON;

  if (!serviceAccountString) {
    console.error('La variable d\'environnement SERVICE_ACCOUNT_JSON est manquante. L\'initialisation de Firebase Admin a échoué.');
    throw new Error('SERVICE_ACCOUNT_JSON environment variable is not set.');
  }

  try {
    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountString);
    
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('Erreur lors de l\'analyse de SERVICE_ACCOUNT_JSON ou de l\'initialisation de Firebase Admin:', error);
    throw new Error('Failed to initialize Firebase Admin SDK.');
  }
}

const adminAuth = admin.auth(adminApp);
const adminDb = admin.firestore(adminApp);

export { adminApp, adminAuth, adminDb };
