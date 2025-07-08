'use server';
/**
 * @fileOverview A flow to send a 6-digit email verification code.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { sendEmail } from '@/services/mailgun-service';
import { updateUserInFirestore } from '@/lib/firebase/firestore';
import { adminDb } from '@/lib/firebase/admin'; // Import adminDb
import { Timestamp } from 'firebase-admin/firestore'; // Use the admin Timestamp

const SendVerificationCodeInputSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  userName: z.string(),
});
export type SendVerificationCodeInput = z.infer<typeof SendVerificationCodeInputSchema>;

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const sendVerificationCodeFlow = ai.defineFlow(
  {
    name: 'sendVerificationCodeFlow',
    inputSchema: SendVerificationCodeInputSchema,
    outputSchema: z.object({ success: z.boolean(), error: z.string().optional() }),
  },
  async ({ userId, email, userName }) => {
    // Check if the admin SDK is initialized before proceeding
    if (!adminDb) {
        const error = "Firebase Admin SDK not initialized. Cannot update user for verification code.";
        console.error(error);
        return { success: false, error };
    }

    const code = generateVerificationCode();
    // Expiry in 10 minutes
    const expires = Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000));

    try {
      // Store the code and expiry on the user's document using the Admin DB
      await updateUserInFirestore(userId, {
        emailVerificationCode: code,
        emailVerificationCodeExpires: expires,
      }, adminDb); // <-- Pass adminDb here

      // Send the email
      const emailSubject = `Votre code de vérification AmCbunq`;
      const emailText = `Bonjour ${userName},\n\nVotre code de vérification est : ${code}\n\nCe code expirera dans 10 minutes.\n\nMerci,\nL'équipe AmCbunq`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #013A81;">Bonjour ${userName},</h2>
            <p>Votre code de vérification pour AmCbunq est :</p>
            <p style="background-color: #f2f2f2; border-radius: 5px; padding: 10px 20px; font-size: 24px; font-weight: bold; letter-spacing: 3px; text-align: center;">${code}</p>
            <p>Ce code expirera dans 10 minutes.</p>
            <p>Si vous n'avez pas demandé ce code, vous pouvez ignorer cet e-mail en toute sécurité.</p>
            <p>Merci,<br>L'équipe AmCbunq</p>
        </div>
      `;

      await sendEmail({
        to: email,
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
      });

      return { success: true };
    } catch (error: any) {
      console.error("Failed to send verification code:", error);
      return { success: false, error: error.message || 'Failed to send verification code' };
    }
  }
);

// Wrapper function
export async function sendVerificationCode(input: SendVerificationCodeInput): Promise<{success: boolean; error?: string}> {
  return sendVerificationCodeFlow(input);
}
