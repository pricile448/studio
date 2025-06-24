
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

export async function submitKycDocuments(input: KycSubmissionInput): Promise<{success: boolean}> {
  return kycSubmissionFlow(input);
}

const ADMIN_EMAIL = process.env.MAILGUN_ADMIN_EMAIL;

const kycSubmissionFlow = ai.defineFlow(
  {
    name: 'kycSubmissionFlow',
    inputSchema: KycSubmissionInputSchema,
    outputSchema: z.object({ success: z.boolean() }),
  },
  async (input) => {
    // Log the full data for debugging/manual review, as data URIs are too large for email.
    console.log('/// --- NOUVELLE SOUMISSION KYC POUR VÉRIFICATION MANUELLE --- ///');
    console.log(`Date: ${new Date().toISOString()}`);
    console.log(`User ID: ${input.userId}`);
    console.log(`User Name: ${input.userName}`);
    console.log(`User Email: ${input.userEmail}`);
    console.log('\n--- DOCUMENTS FOURNIS (Data URIs) ---');
    console.log(`Pièce d'identité: ${input.idDocumentDataUri.substring(0, 100)}...`);
    console.log(`Justificatif de domicile: ${input.proofOfAddressDataUri.substring(0, 100)}...`);
    console.log(`Selfie: ${input.selfieDataUri.substring(0, 100)}...`);
    console.log('/// --- FIN DE LA SOUMISSION KYC --- ///');

    // Send a notification email to the admin
    if (!ADMIN_EMAIL) {
      console.error("MAILGUN_ADMIN_EMAIL is not set. Cannot send KYC notification email.");
      return { success: false };
    }

    const emailSubject = `Nouvelle soumission KYC pour ${input.userName}`;
    const emailHtml = `
      <h1>Nouvelle soumission KYC</h1>
      <p>Un nouvel utilisateur a soumis ses documents pour la vérification d'identité.</p>
      <h2>Détails de l'utilisateur :</h2>
      <ul>
        <li><strong>ID Utilisateur:</strong> ${input.userId}</li>
        <li><strong>Nom:</strong> ${input.userName}</li>
        <li><strong>Email:</strong> ${input.userEmail}</li>
      </ul>
      <p>Les documents (Pièce d'identité, Justificatif de domicile, Selfie) ont été soumis.</p>
      <p>Veuillez vous connecter au panneau d'administration pour les examiner et valider le compte.</p>
      <p><em>(Pour ce prototype, les documents sont enregistrés dans les logs du serveur.)</em></p>
    `;
    const emailText = `
      Nouvelle soumission KYC pour ${input.userName}.
      Détails :
      - ID Utilisateur: ${input.userId}
      - Nom: ${input.userName}
      - Email: ${input.userEmail}
      Veuillez examiner les documents dans le panneau d'administration.
    `;

    try {
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: emailSubject,
        html: emailHtml,
        text: emailText,
      });
      return { success: true };
    } catch (error) {
      console.error("Failed to send KYC email:", error);
      return { success: false };
    }
  }
);
