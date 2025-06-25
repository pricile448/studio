
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

export async function submitKycDocuments(input: KycSubmissionInput): Promise<{success: boolean; error?: string}> {
  return kycSubmissionFlow(input);
}

const ADMIN_EMAIL = process.env.MAILGUN_ADMIN_EMAIL;

/**
 * Converts a data URI to a buffer and a filename with the correct extension.
 * @param dataUri The data URI to process.
 * @param baseFilename The base name for the file (e.g., 'id-document').
 * @returns An object with the data buffer and filename, or null if the URI is invalid.
 */
function processAttachment(dataUri: string, baseFilename: string): { data: Buffer; filename: string } | null {
    const match = dataUri.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
        console.error(`Invalid data URI format for ${baseFilename}`);
        return null;
    }

    const mimeType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    let extension = '';
    switch (mimeType) {
        case 'image/jpeg':
        case 'image/jpg':
            extension = '.jpg';
            break;
        case 'image/png':
            extension = '.png';
            break;
        case 'application/pdf':
            extension = '.pdf';
            break;
        default:
            const subType = mimeType.split('/')[1];
            if (subType) {
                extension = `.${subType}`;
            } else {
                console.warn(`Unsupported MIME type for attachment: ${mimeType}, no extension will be used.`);
            }
    }

    return {
        data: buffer,
        filename: `${baseFilename}${extension}`
    };
}


const kycSubmissionFlow = ai.defineFlow(
  {
    name: 'kycSubmissionFlow',
    inputSchema: KycSubmissionInputSchema,
    outputSchema: z.object({ success: z.boolean(), error: z.string().optional() }),
  },
  async (input) => {
    // Send a notification email to the admin
    if (!ADMIN_EMAIL) {
        const error = "MAILGUN_ADMIN_EMAIL is not set. Cannot send KYC notification email.";
        console.error(error);
        return { success: false, error };
    }

    const attachments = [
        processAttachment(input.idDocumentDataUri, `id-document-${input.userId}`),
        processAttachment(input.proofOfAddressDataUri, `proof-of-address-${input.userId}`),
        processAttachment(input.selfieDataUri, `selfie-${input.userId}`),
    ].filter((att) => att !== null) as { data: Buffer; filename: string }[];

    if (attachments.length !== 3) {
      const error = 'Failed to process one or more of the document files for attachment.';
      console.error(error);
      return { success: false, error };
    }

    const emailSubject = `Nouvelle soumission KYC pour ${input.userName} (${input.userId})`;
    const emailHtml = `
      <h1>Nouvelle soumission KYC</h1>
      <p>Un nouvel utilisateur a soumis ses documents pour la vérification d'identité. Les fichiers sont attachés à cet e-mail.</p>
      <h2>Détails de l'utilisateur :</h2>
      <ul>
        <li><strong>ID Utilisateur:</strong> ${input.userId}</li>
        <li><strong>Nom:</strong> ${input.userName}</li>
        <li><strong>Email:</strong> ${input.userEmail}</li>
      </ul>
      <p>Veuillez examiner les documents en pièce jointe et valider le compte dans le panneau d'administration.</p>
    `;
    const emailText = `
      Nouvelle soumission KYC pour ${input.userName}.
      Les documents sont attachés.
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
            attachment: attachments,
        });
        return { success: true };
    } catch (error: any) {
        console.error("Failed to send KYC email:", error);
        return { success: false, error: error.message || 'Failed to send KYC email' };
    }
  }
);
