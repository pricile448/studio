
'use server';
/**
 * @fileOverview A flow to securely create a user document in Firestore after registration.
 */

import { ai } from '@/ai/genkit';
import { adminDb } from '@/lib/firebase/admin';
import { z } from 'zod';
import { Timestamp, FieldValue } from 'firebase-admin/firestore'; // Use Admin SDK imports
import type { Account } from '@/lib/firebase/firestore';


const CreateUserDocumentInputSchema = z.object({
    uid: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    dob: z.string(), // Pass date as ISO string
    pob: z.string(),
    nationality: z.string(),
    residenceCountry: z.string(),
    address: z.string(),
    city: z.string(),
    postalCode: z.string(),
    profession: z.string(),
    salary: z.number(),
});

type CreateUserDocumentInput = z.infer<typeof CreateUserDocumentInputSchema>;


export async function createUserDocument(input: CreateUserDocumentInput): Promise<{success: boolean; error?: string}> {
    return createUserDocumentFlow(input);
}


const createUserDocumentFlow = ai.defineFlow(
  {
    name: 'createUserDocumentFlow',
    inputSchema: CreateUserDocumentInputSchema,
    outputSchema: z.object({ success: z.boolean(), error: z.string().optional() }),
  },
  async (userData) => {
    if (!adminDb) {
        const error = "Firebase Admin SDK n'est pas initialisé. Pour le développement local, vérifiez la variable SERVICE_ACCOUNT_JSON dans votre fichier .env. Pour la production (Vercel, etc.), définissez-la dans les variables d'environnement de votre hébergeur. Consultez DEPLOYMENT.md pour les instructions.";
        console.error(error);
        return { success: false, error };
    }

    try {
        const userRef = adminDb.collection("users").doc(userData.uid);
        
        const defaultAccounts: Account[] = [
            { id: 'checking-1', name: 'checking', balance: 0, currency: 'EUR', accountNumber: '**** **** **** 1234', status: 'active' },
            { id: 'savings-1', name: 'savings', balance: 0, currency: 'EUR', accountNumber: '**** **** **** 5678', status: 'active' },
            { id: 'credit-1', name: 'credit', balance: 0, currency: 'EUR', accountNumber: '**** **** **** 9010', status: 'active' },
        ];

        // The dob is passed as a string, convert it back to a Date object, then to a Timestamp for Firestore.
        const dobAsDate = new Date(userData.dob);
        if (isNaN(dobAsDate.getTime())) {
            throw new Error('Invalid date of birth format.');
        }
        
        const { uid, ...registrationData} = userData;

        const fullProfile = {
            ...registrationData,
            uid: uid,
            dob: Timestamp.fromDate(dobAsDate), // Uses Timestamp from firebase-admin
            kycStatus: 'unverified' as const,
            cardStatus: 'none' as const,
            cardLimits: { monthly: 2000, withdrawal: 500 },
            notificationPrefs: {
                email: true,
                promotions: false,
                security: true,
            },
            inactivityTimeout: 5,
            hasPendingVirtualCardRequest: false,
            accounts: defaultAccounts,
            transactions: [],
            beneficiaries: [],
            budgets: [],
            documents: [],
            virtualCards: [],
            advisorId: 'advisor_123',
            createdAt: FieldValue.serverTimestamp(), // Uses FieldValue from firebase-admin
        };

        await userRef.set(fullProfile); // Use Admin SDK's .set() method
        
        return { success: true };

    } catch (error: any) {
        console.error("Error creating user document in flow:", error);
        let errorMessage = "Échec de la création du profil utilisateur dans la base de données.";
        if (error.message && error.message.includes('Could not refresh access token')) {
            errorMessage = "Échec de l'authentification auprès de Firebase. Veuillez vérifier que votre variable d'environnement `SERVICE_ACCOUNT_JSON` sur Vercel est correcte et valide. Consultez DEPLOYMENT.md.";
        } else if (error.message) {
            errorMessage += ` Détail : ${error.message}`;
        }
        return { success: false, error: errorMessage };
    }
  }
);
