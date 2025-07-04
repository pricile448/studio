
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
} else if (isProduction) {
    // In a deployed App Hosting environment, Application Default Credentials are used.
    try {
        admin.initializeApp();
        console.log("Firebase Admin SDK initialized with Application Default Credentials for production.");
        adminInitialized = true;
    } catch(error: any) {
        console.error('Firebase Admin SDK initialization error in production with ADC:', error.message);
    }
} else if (serviceAccountJson) {
    // For local development, SERVICE_ACCOUNT_JSON is the required method.
    try {
        const serviceAccount = JSON.parse(serviceAccountJson);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id,
        });
        console.log("Firebase Admin SDK initialized with SERVICE_ACCOUNT_JSON for local development.");
        adminInitialized = true;
    } catch (error: any) {
        console.error('Firebase Admin SDK initialization error from JSON:', error.message);
        // Provide a hint to the user if parsing fails
        if (error.message.includes('JSON.parse')) {
            console.error("Hint: The SERVICE_ACCOUNT_JSON environment variable might be malformed. Ensure it's a valid JSON string wrapped in single quotes.");
        }
    }
}

// If after all attempts, the SDK is not initialized, we show a clear warning.
if (!adminInitialized) {
     console.warn(
        '\n********************************************************************************************************\n' +
        "WARN: Firebase Admin SDK could not be initialized.\n" +
        "For local development, the SERVICE_ACCOUNT_JSON environment variable must be set in your .env file.\n" +
        "Server-side admin features (like the Admin Dashboard) will not work.\n" +
        "Please see the 'Étape 1.5' section in DEPLOYMENT.md for instructions.\n" +
        '********************************************************************************************************\n'
    );
}

// Conditionally export to prevent errors if initialization fails.
// Code using these exports should handle the null case.
export const adminDb = adminInitialized ? admin.firestore() : null;
export const adminAuth = adminInitialized ? admin.auth() : null;
export const adminStorage = adminInitialized ? admin.storage() : null;
