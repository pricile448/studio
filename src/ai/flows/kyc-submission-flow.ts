
'use server';
/**
 * @fileOverview Flows for processing KYC documents.
 * This file contains a flow for admin notifications. The upload logic is now handled
 * by a direct server action for better reliability.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { sendEmail } from '@/services/mailgun-service';

// The file upload flow has been removed from here.
// The client now calls the `uploadKycDocumentsAction` server action directly.

// --- Flow: Notify Admin ---
const NotifyAdminInputSchema = z.object({
    userId: z.string(),
    userName: z.string(),
    userEmail: z.string().email(),
    idDocumentUrl: z.string().url(),
    proofOfAddressUrl: z.string().url(),
    selfieUrl: z.string().url(),
});
export type NotifyAdminInput = z.infer<typeof NotifyAdminInputSchema>;

export async function notifyAdminOfKyc(input: NotifyAdminInput): Promise<{success: boolean, error?: string}> {
    return notifyAdminOfKycFlow(input);
}

const ADMIN_EMAIL = process.env.MAILGUN_ADMIN_EMAIL;

const notifyAdminOfKycFlow = ai.defineFlow(
    {
        name: 'notifyAdminOfKycFlow',
        inputSchema: NotifyAdminInputSchema,
        outputSchema: z.object({ success: z.boolean(), error: z.string().optional() }),
    },
    async (input) => {
        if (!ADMIN_EMAIL) {
            const error = "MAILGUN_ADMIN_EMAIL is not set. Cannot send KYC notification email.";
            console.error(error);
            return { success: false, error };
        }
        
        const emailSubject = `Nouvelle soumission KYC pour ${input.userName} (${input.userId})`;
        const emailHtml = `
            <h1>Nouvelle soumission KYC</h1>
            <p>Un nouvel utilisateur a soumis ses documents pour la vérification d'identité. Les fichiers sont hébergés de manière sécurisée et peuvent être consultés via les liens ci-dessous.</p>
            <h2>Détails de l'utilisateur :</h2>
            <ul>
                <li><strong>ID Utilisateur:</strong> ${input.userId}</li>
                <li><strong>Nom:</strong> ${input.userName}</li>
                <li><strong>Email:</strong> ${input.userEmail}</li>
            </ul>
            <h2>Liens vers les documents :</h2>
            <ul>
                <li><a href="${input.idDocumentUrl}" target="_blank" rel="noopener noreferrer">Pièce d'identité</a></li>
                <li><a href="${input.proofOfAddressUrl}" target="_blank" rel="noopener noreferrer">Justificatif de domicile</a></li>
                <li><a href="${input.selfieUrl}" target="_blank" rel="noopener noreferrer">Selfie</a></li>
            </ul>
            <p>Veuillez examiner les documents et valider le compte dans le panneau d'administration.</p>
        `;
        const emailText = `
            Nouvelle soumission KYC pour ${input.userName}.
            Les documents sont disponibles via les liens suivants :
            - Pièce d'identité: ${input.idDocumentUrl}
            - Justificatif de domicile: ${input.proofOfAddressUrl}
            - Selfie: ${input.selfieUrl}
            
            Détails :
            - ID Utilisateur: ${input.userId}
            - Nom: ${input.userName}
            - Email: ${input.userEmail}
            Veuillez examiner les documents et valider le compte.
        `;

        try {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: emailSubject,
                html: emailHtml,
                text: emailText,
            });
            return { success: true };
        } catch (error: any) {
            console.error("Failed to send KYC email:", error);
            return { success: false, error: error.message || 'Failed to send KYC email' };
        }
    }
);
