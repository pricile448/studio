import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

let adminDbInstance: admin.firestore.Firestore | null = null;
let isInitialized = false;

function initializeAdminApp() {
  if (isInitialized) {
    return;
  }
  isInitialized = true; // Attempt initialization only once

  if (admin.apps.length > 0) {
    adminDbInstance = admin.firestore();
    return;
  }

  const serviceAccountString = process.env.SERVICE_ACCOUNT_JSON;
  if (!serviceAccountString) {
    console.warn("SERVICE_ACCOUNT_JSON is not set. Firebase Admin SDK will not be initialized. This is expected in client-side rendering.");
    return;
  }
  
  try {
    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountString);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    adminDbInstance = admin.firestore();
  } catch (error) {
    console.error("Error parsing SERVICE_ACCOUNT_JSON or initializing Firebase Admin:", error);
  }
}

// Export a getter that ensures initialization before use.
export function getAdminDb() {
  if (!adminDbInstance) {
    initializeAdminApp();
  }
  if (!adminDbInstance) {
    // This provides a specific, actionable error when admin features are used without proper setup.
    throw new Error('Firebase Admin SDK (Firestore) has not been initialized. Please ensure the SERVICE_ACCOUNT_JSON environment variable is set correctly in your deployment environment.');
  }
  return adminDbInstance;
}
