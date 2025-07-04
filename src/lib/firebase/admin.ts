import * as admin from 'firebase-admin';

// This file is intended for server-side use only.
// It initializes the Firebase Admin SDK.

if (!admin.apps.length) {
    try {
        const serviceAccountJson = process.env.SERVICE_ACCOUNT_JSON;
        if (serviceAccountJson) {
            const serviceAccount = JSON.parse(serviceAccountJson);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id,
            });
            console.log("Firebase Admin SDK initialized with SERVICE_ACCOUNT_JSON.");
        } else {
            // Fallback for environments where Application Default Credentials are available (like App Hosting)
            admin.initializeApp();
            console.log("Firebase Admin SDK initialized with Application Default Credentials.");
        }
    } catch (error: any) {
        console.error('Firebase Admin SDK initialization error:', error.message);
        // It's useful to provide a hint to the user if parsing fails
        if (error.message.includes('JSON.parse')) {
             console.error("Hint: The SERVICE_ACCOUNT_JSON environment variable might be malformed. Ensure it's a valid JSON string.");
        }
    }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
