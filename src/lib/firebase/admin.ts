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
    console.error("SERVICE_ACCOUNT_JSON is missing. Firebase Admin SDK initialization failed.");
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

function getAdminDb() {
  if (!adminApp) {
    console.log("Admin App not initialized, attempting re-initialization...");
    initializeAdminApp();
    if (!adminApp) {
      throw new Error('Failed to initialize Firebase Admin SDK. Check server logs for details.');
    }
  }
  return admin.firestore(adminApp);
}

function getAdminAuth() {
    if (!adminApp) {
        console.log("Admin App not initialized, attempting re-initialization...");
        initializeAdminApp();
        if (!adminApp) {
            throw new Error('Failed to initialize Firebase Admin SDK. Check server logs for details.');
        }
    }
    return admin.auth(adminApp);
}


// Export getters instead of raw instances to ensure initialization
export const adminDb = getAdminDb();
export const adminAuth = getAdminAuth();
export { adminApp };
