import * as admin from 'firebase-admin';

// This file is intended for server-side use only.
// It initializes the Firebase Admin SDK.

try {
  if (!admin.apps.length) {
    // When deployed to Google Cloud environments, the SDK will automatically
    // find the correct credentials.
    admin.initializeApp();
  }
} catch (error) {
  console.error('Firebase Admin SDK initialization error:', error);
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
