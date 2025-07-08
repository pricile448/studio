
'use server';
/**
 * @fileOverview A flow to verify the 6-digit email verification code.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { sendEmail } from '@/services/mailgun-service';

const VerifyEmailCodeInputSchema = z.object({
  userId: z.string(),
  code: z.string().length(6),
});
export type VerifyEmailCodeInput = z.infer<typeof VerifyEmailCodeInputSchema>;

const verifyEmailCodeFlow = ai.defineFlow(
  {
    name: 'verifyEmailCodeFlow',
    inputSchema: VerifyEmailCodeInputSchema,
    outputSchema: z.object({ success: z.boolean(), error: z.string().optional() }),
  },
  async ({ userId, code }) => {
    if (!adminAuth || !adminDb) {
      const error = "Firebase Admin SDK not initialized.";
      console.error(error);
      return { success: false, error };
    }

    try {
      const userRef = adminDb.collection('users').doc(userId);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        return { success: false, error: "Utilisateur non trouvé." };
      }

      const userData = userSnap.data();
      if (!userData) {
         return { success: false, error: "Données utilisateur introuvables." };
      }

      const storedCode = userData.emailVerificationCode;
      const expiry = userData.emailVerificationCodeExpires?.toDate();

      if (!storedCode || !expiry) {
        return { success: false, error: "Aucun code de vérification trouvé pour cet utilisateur." };
      }

      if (expiry < new Date()) {
        // Clear expired code
        await userRef.update({
            emailVerificationCode: null,
            emailVerificationCodeExpires: null,
        });
        return { success: false, error: "Le code de vérification a expiré. Veuillez en demander un nouveau." };
      }

      if (storedCode !== code) {
        return { success: false, error: "Code de vérification invalide." };
      }

      // Code is valid. Update Auth and Firestore.
      await adminAuth.updateUser(userId, { emailVerified: true });
      
      // Clear verification fields in Firestore
      await userRef.update({
        emailVerificationCode: null,
        emailVerificationCodeExpires: null,
      });

      // --- New feature: Send welcome email after verification ---
      try {
        const userName = userData.firstName || 'nouvel utilisateur';
        const emailSubject = `Votre compte AmCbunq est activé`;
        const emailText = `
          Bonjour ${userName},

          Votre adresse e-mail a été vérifiée avec succès. Votre compte est maintenant actif.

          Pour accéder à votre espace client, veuillez visiter : ${process.env.NEXT_PUBLIC_BASE_URL || 'https://mybunq.amccredit.com'}

          Cordialement,
          L'équipe AmCbunq
        `;
        const emailHtml = `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
              <meta charset="UTF-8">
              <title>Confirmation de compte AmCbunq</title>
          </head>
          <body style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0;">
              <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #dddddd; border-radius: 8px;">
                  <h1 style="font-size: 24px; color: #013A81; margin: 0 0 20px 0;">AmCbunq</h1>
                  <h2 style="font-size: 18px; color: #333333; margin: 0 0 10px 0;">Bonjour ${userName},</h2>
                  <p style="margin: 0 0 15px 0;">Votre adresse e-mail a été vérifiée avec succès. Votre compte est maintenant actif.</p>
                  <p style="margin: 0 0 25px 0;">Vous pouvez maintenant vous connecter à votre espace client pour gérer vos finances :</p>
                  <p style="margin: 25px 0; text-align: center;">
                      <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://mybunq.amccredit.com'}" style="background-color: #013A81; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Accéder à mon compte AmCbunq</a>
                  </p>
                  <p style="margin: 30px 0 0 0;">Cordialement,<br>L'équipe AmCbunq</p>
                  <hr style="border: 0; border-top: 1px solid #dddddd; margin: 20px 0;">
                  <p style="font-size: 12px; color: #999999; margin: 0; text-align: center;">© ${new Date().getFullYear()} AmCbunq. Tous droits réservés.</p>
              </div>
          </body>
          </html>
        `;

        await sendEmail({
            to: userData.email,
            subject: emailSubject,
            text: emailText,
            html: emailHtml,
        });

      } catch (emailError: any) {
          // Log the error but don't fail the entire flow because of it.
          // The user verification was successful, which is the main goal.
          console.error("Failed to send welcome email after verification:", emailError);
      }
      // --- End of new feature ---

      return { success: true };
    } catch (error: any) {
      console.error("Failed to verify email code:", error);
      let errorMessage = error.message || "Échec de la vérification du code d'e-mail";
      
      // Provide a more user-friendly error for the specific GCP permission issue.
      if (typeof errorMessage === 'string' && errorMessage.includes('serviceusage.services.use')) {
          errorMessage = "Une permission est manquante sur Google Cloud. Le compte de service de votre application (service account) doit avoir le rôle 'Consommateur de services' (Service Usage Consumer) pour fonctionner correctement. Veuillez ajouter ce rôle dans la section IAM de la console Google Cloud.";
      }

      return { success: false, error: errorMessage };
    }
  }
);

export async function verifyEmailCode(input: VerifyEmailCodeInput): Promise<{ success: boolean; error?: string }> {
  return verifyEmailCodeFlow(input);
}
