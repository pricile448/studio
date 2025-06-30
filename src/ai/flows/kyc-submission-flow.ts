
'use server';
/**
 * @fileOverview A KYC submission flow.
 *
 * This file exports:
 * - `submitKycDocuments`: Handles the KYC document submission.
 * - `KycSubmissionInput`: Input type for `submitKycDocuments` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { sendEmail } from '@/services/mailgun-service';
import { uploadToCloudinary } from '@/services/cloudinary-service';
import { getFirebaseServices } from '@/lib/firebase/config';
import { updateUserInFirestore } from '@/lib/firebase/firestore';

const KycSubmissionInputSchema = z.object({
  userId: z.string().describe('The unique ID of the user.'),
  userName: z.string().describe("The user's full name."),
  userEmail: z.string().email().describe("The user's email address."),
  idDocumentDataUri: z.string().describe(
    "The identity document as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  proofOfAddressDataUri: z.string().describe(
    "The proof of address document as a data URI that must include a MIME type and use Base64 encoding."
  ),
  selfieDataUri: z.string().describe(
    "The user's selfie as a data URI that must include a MIME type and use Base64 encoding."
  ),
});
export type KycSubmissionInput = z.infer<typeof KycSubmissionInputSchema>;

export async function submitKycDocuments(input: KycSubmissionInput): Promise<{success: boolean; error?: string}> {
  return kycSubmissionFlow(input);
}

const ADMIN_EMAIL = process.env.MAILGUN_ADMIN_EMAIL;
const { db: adminDb } = getFirebaseServices('admin');

const kycSubmissionFlow = ai.defineFlow(
  {
    name: 'kycSubmissionFlow',
    inputSchema: KycSubmissionInputSchema,
    outputSchema: z.object({ success: z.boolean(), error: z.string().optional() }),
  },
  async (input) => {
    if (!ADMIN_EMAIL) {
        const error = "MAILGUN_ADMIN_EMAIL is not set. Cannot send KYC notification email.";
        console.error(error);
        return { success: false, error };
    }

    let idDocumentUrl, proofOfAddressUrl, selfieUrl;

    try {
        const uploadFolder = `kyc_documents/${input.userId}`;

        [idDocumentUrl, proofOfAddressUrl, selfieUrl] = await Promise.all([
            uploadToCloudinary(input.idDocumentDataUri, uploadFolder, 'identity_document'),
            uploadToCloudinary(input.proofOfAddressDataUri, uploadFolder, 'proof_of_address'),
            uploadToCloudinary(input.selfieDataUri, uploadFolder, 'selfie_photo')
        ]);

        const kycDocuments = { idDocumentUrl, proofOfAddressUrl, selfieUrl };
        await updateUserInFirestore(input.userId, { kycDocuments }, adminDb);

    } catch (error: any) {
        console.error("Failed to upload documents or update user profile:", error);
        return { success: false, error: error.message || 'Failed to upload one or more documents.' };
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
        <li><a href="${idDocumentUrl}" target="_blank" rel="noopener noreferrer">Pièce d'identité</a></li>
        <li><a href="${proofOfAddressUrl}" target="_blank" rel="noopener noreferrer">Justificatif de domicile</a></li>
        <li><a href="${selfieUrl}" target="_blank" rel="noopener noreferrer">Selfie</a></li>
      </ul>
      <p>Veuillez examiner les documents et valider le compte dans le panneau d'administration.</p>
    `;
    const emailText = `
      Nouvelle soumission KYC pour ${input.userName}.
      Les documents sont disponibles via les liens suivants :
      - Pièce d'identité: ${idDocumentUrl}
      - Justificatif de domicile: ${proofOfAddressUrl}
      - Selfie: ${selfieUrl}
      
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
