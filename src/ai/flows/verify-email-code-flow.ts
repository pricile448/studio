
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
        const emailSubject = `Bienvenue chez AmCbunq ! Votre compte est activé.`;
        const emailText = `
Bonjour ${userName},

Félicitations ! Votre adresse e-mail a été vérifiée avec succès. Votre compte AmCbunq est maintenant entièrement actif.

Vous pouvez dès maintenant :
- Commander votre carte bancaire pour vos achats.
- Effectuer des virements en toute sécurité.
- Créer des budgets pour mieux gérer vos finances.
- Découvrir toutes les fonctionnalités de votre espace client.

Connectez-vous pour découvrir tout ce que AmCbunq a à vous offrir.

L'équipe AmCbunq
        `;
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
                                                  <h1 style="color: #2F3133; font-size: 19px; font-weight: bold; margin-top: 0;">Félicitations, ${userName} !</h1>
                                                  <p style="color: #74787E; font-size: 16px; line-height: 1.5em; margin-top: 0;">Votre adresse e-mail a été vérifiée avec succès. Votre compte AmCbunq est maintenant entièrement actif.</p>
                                                  <p style="color: #74787E; font-size: 16px; line-height: 1.5em; margin-top: 0;">Vous pouvez dès maintenant explorer toutes les fonctionnalités :</p>
                                                  <ul style="color: #74787E; font-size: 16px; line-height: 1.5em; margin-top: 0; padding-left: 20px;">
                                                      <li>Commander votre carte bancaire pour vos achats.</li>
                                                      <li>Effectuer des virements en toute sécurité.</li>
                                                      <li>Créer des budgets pour mieux gérer vos finances.</li>
                                                      <li>Découvrir toutes les fonctionnalités de votre espace client.</li>
                                                  </ul>
                                                  <p style="color: #74787E; font-size: 16px; line-height: 1.5em; margin-top: 0;">Connectez-vous pour découvrir tout ce que AmCbunq a à vous offrir.</p>
                                                  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="margin: 30px auto; padding: 0; text-align: center; width: 100%;">
                                                      <tr>
                                                          <td align="center">
                                                              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://mybunq.amccredit.com'}" style="background-color: #013A81; border-radius: 5px; color: #ffffff; display: inline-block; padding: 12px 25px; text-decoration: none; font-weight: bold;">Se connecter</a>
                                                          </td>
                                                      </tr>
                                                  </table>
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
