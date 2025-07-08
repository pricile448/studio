
'use server';
/**
 * @fileOverview A flow to send a 6-digit email verification code.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { sendEmail } from '@/services/mailgun-service';
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
      // Use Admin SDK directly to update the document
      const userRef = adminDb.collection('users').doc(userId);
      await userRef.update({
        emailVerificationCode: code,
        emailVerificationCodeExpires: expires,
      });

      // Send the email
      const emailSubject = `Votre code de vérification AmCbunq`;
      const emailText = `Bonjour ${userName},\n\nVotre code de vérification est : ${code}\n\nCe code expirera dans 10 minutes.\n\nSi vous n'avez pas demandé ce code, vous pouvez ignorer cet e-mail en toute sécurité.\n\nMerci,\nL'équipe AmCbunq`;
      const emailHtml = `
        <div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; box-sizing: border-box; background-color: #f5f8fa; color: #74787e; height: 100%; line-height: 1.4; margin: 0; width: 100% !important; -webkit-text-size-adjust: none;">
            <table width="100%" cellpadding="0" cellspacing="0" style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; box-sizing: border-box; margin: 0; padding: 0; width: 100%;">
                <tr>
                    <td align="center">
                        <table width="100%" cellpadding="0" cellspacing="0" style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; box-sizing: border-box; margin: 0; padding: 0; width: 100%;">
                            <!-- Email Header -->
                            <tr>
                                <td style="padding: 25px 0; text-align: center;">
                                    <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://mybunq.amccredit.com'}" style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; box-sizing: border-box; color: #013A81; font-size: 19px; font-weight: bold; text-decoration: none;">
                                        AmCbunq
                                    </a>
                                </td>
                            </tr>
                            <!-- Email Body -->
                            <tr>
                                <td width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-bottom: 1px solid #edeff2; border-top: 1px solid #edeff2; margin: 0; padding: 0; width: 100%;">
                                    <table align="center" width="570" cellpadding="0" cellspacing="0" style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; box-sizing: border-box; margin: 0 auto; padding: 0; width: 570px;">
                                        <tr>
                                            <td style="padding: 35px;">
                                                <h1 style="color: #2F3133; font-size: 19px; font-weight: bold; margin-top: 0;">Bonjour ${userName},</h1>
                                                <p style="color: #74787E; font-size: 16px; line-height: 1.5em; margin-top: 0;">Votre code de vérification pour AmCbunq est :</p>
                                                <table align="center" width="100%" cellpadding="0" cellspacing="0" style="margin: 30px auto; padding: 0; text-align: center; width: 100%;">
                                                    <tr>
                                                        <td align="center">
                                                            <div style="background-color: #f2f2f2; border-radius: 5px; padding: 15px 25px; font-size: 30px; font-weight: bold; letter-spacing: 5px; display: inline-block;">${code}</div>
                                                        </td>
                                                    </tr>
                                                </table>
                                                <p style="color: #74787E; font-size: 16px; line-height: 1.5em; margin-top: 0;">Ce code expirera dans 10 minutes.</p>
                                                <p style="color: #74787E; font-size: 16px; line-height: 1.5em; margin-top: 0;">Si vous n'avez pas demandé ce code, vous pouvez ignorer cet e-mail en toute sécurité.</p>
                                                <p style="color: #74787E; font-size: 16px; line-height: 1.5em; margin-top: 0;">Merci,<br>L'équipe AmCbunq</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <!-- Email Footer -->
                            <tr>
                                <td>
                                    <table align="center" width="570" cellpadding="0" cellspacing="0" style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; box-sizing: border-box; margin: 0 auto; padding: 0; text-align: center; width: 570px;">
                                        <tr>
                                            <td align="center" style="padding: 35px;">
                                                <p style="color: #aeaeae; font-size: 12px; line-height: 1.5em; margin-top: 0; text-align: center;">© ${new Date().getFullYear()} AmCbunq. Tous droits réservés.</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
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
