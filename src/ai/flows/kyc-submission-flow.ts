
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

const kycSubmissionFlow = ai.defineFlow(
  {
    name: 'kycSubmissionFlow',
    inputSchema: KycSubmissionInputSchema,
    outputSchema: z.object({ success: z.boolean() }),
  },
  async (input) => {
    // In a real application, you would integrate an email service like SendGrid or Mailgun here.
    // This flow would format and send an email containing the user's data and the document data URIs
    // to an administrative address for manual review.
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
    
    // Simulate a successful submission for email generation
    return { success: true };
  }
);
