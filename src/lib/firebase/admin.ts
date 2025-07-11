
import * as admin from 'firebase-admin';

// This file is intended for server-side use only.
// It initializes the Firebase Admin SDK.

let adminInitialized = false;

// We check if we are in a production environment. 
// App Hosting automatically sets NODE_ENV to 'production'.
const isProduction = process.env.NODE_ENV === 'production';
const serviceAccountJson = process.env.SERVICE_ACCOUNT_JSON;

if (admin.apps.length) {
    adminInitialized = true;
} else if (serviceAccountJson) {
    // Priority 1: Use SERVICE_ACCOUNT_JSON if provided.
    // This works for both local dev and any production environment where the var is set.
    try {
        const serviceAccount = JSON.parse(serviceAccountJson);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id,
        });
        console.log("Firebase Admin SDK initialized using SERVICE_ACCOUNT_JSON.");
        adminInitialized = true;
    } catch (error: any) {
        console.error('Firebase Admin SDK initialization error from JSON:', error.message);
        if (error.message.includes('JSON.parse')) {
            console.error("Hint: The SERVICE_ACCOUNT_JSON environment variable is likely malformed. In your .env file, ensure the entire multi-line JSON object is wrapped in single quotes. Example: SERVICE_ACCOUNT_JSON='{...}'");
        }
    }
} else if (isProduction) {
    // Priority 2: If in production and no JSON is provided, try Application Default Credentials.
    // This is the default behavior for environments like Firebase App Hosting.
    try {
        admin.initializeApp({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
        console.log("Firebase Admin SDK initialized for production with Application Default Credentials.");
        adminInitialized = true;
    } catch(error: any) {
        console.error('Firebase Admin SDK initialization error in production (ADC):', error.message);
    }
}


// If after all attempts, the SDK is not initialized, we show a clear warning.
if (!adminInitialized) {
     console.warn(
        '\n********************************************************************************************************\n' +
        "WARN: Firebase Admin SDK could not be initialized.\n" +
        "For local development, the SERVICE_ACCOUNT_JSON environment variable must be set in your .env file.\n" +
        "For production, it must be set in your hosting provider's environment variable settings.\n" +
        "Server-side admin features (like the Admin Dashboard) will not work.\n" +
        "Please see the 'Étape 3' section in DEPLOYMENT.md for instructions.\n" +
        '********************************************************************************************************\n'
    );
}

// Conditionally export to prevent errors if initialization fails.
// Code using these exports should handle the null case.
export const adminDb = adminInitialized ? admin.firestore() : null;
export const adminAuth = adminInitialized ? admin.auth() : null;
export const adminStorage = adminInitialized ? admin.storage() : null;

    