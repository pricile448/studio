// src/lib/firebase/admin.ts
import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

let adminApp: admin.app.App | null = null;

function initializeAdminApp() {
  if (admin.apps.length > 0) {
    adminApp = admin.app('[DEFAULT]');
    return;
  }
  
  const serviceAccountString = process.env.SERVICE_ACCOUNT_JSON;
  if (!serviceAccountString) {
    // Return early but don't throw, so the app can build.
    // Functions using adminDb will throw a more specific error.
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

// Initialize on first load
initializeAdminApp();

function getAdminSdk() {
  if (!adminApp) {
    // This provides a specific, actionable error when admin features are used without proper setup.
    throw new Error('Firebase Admin SDK has not been initialized. Please ensure the SERVICE_ACCOUNT_JSON environment variable is set correctly in your deployment environment.');
  }
  return adminApp;
}

// Export getters that enforce initialization before use.
export const adminDb = getAdminSdk().firestore();
export const adminAuth = getAdminSdk().auth();
export { adminApp };