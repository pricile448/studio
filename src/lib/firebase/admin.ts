import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

let adminApp: admin.app.App | null = null;
let adminDbInstance: admin.firestore.Firestore | null = null;
let adminAuthInstance: admin.auth.Auth | null = null;

function initializeAdminApp() {
  if (admin.apps.length > 0) {
    adminApp = admin.apps[0]; // Get the default app
  } else {
    const serviceAccountString = process.env.SERVICE_ACCOUNT_JSON;
    if (!serviceAccountString) {
      console.error("SERVICE_ACCOUNT_JSON is missing. Firebase Admin SDK initialization skipped.");
      return;
    }
    
    try {
      const serviceAccount: ServiceAccount = JSON.parse(serviceAccountString);
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error) {
      console.error("Error parsing SERVICE_ACCOUNT_JSON or initializing Firebase Admin:", error);
      adminApp = null;
    }
  }

  if (adminApp) {
    adminDbInstance = admin.firestore();
    adminAuthInstance = admin.auth();
  }
}

// Initialize on first load
initializeAdminApp();

// Export getters that enforce initialization before use.
export function getAdminDb() {
  if (!adminDbInstance) {
    // This provides a specific, actionable error when admin features are used without proper setup.
    throw new Error('Firebase Admin SDK (Firestore) has not been initialized. Please ensure the SERVICE_ACCOUNT_JSON environment variable is set correctly in your deployment environment.');
  }
  return adminDbInstance;
}

export function getAdminAuth() {
  if (!adminAuthInstance) {
     throw new Error('Firebase Admin SDK (Auth) has not been initialized. Please ensure the SERVICE_ACCOUNT_JSON environment variable is set correctly in your deployment environment.');
  }
  return adminAuthInstance;
}

export { adminApp };
