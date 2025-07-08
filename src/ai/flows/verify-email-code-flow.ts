
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
- Commander votre carte bancaire physique ou virtuelle.
- Effectuer des virements sécurisés.
- Créer des budgets pour suivre vos dépenses.
- Profiter de toutes nos offres promotionnelles.

Connectez-vous pour découvrir tout ce que AmCbunq a à vous offrir.

L'équipe AmCbunq
        `;
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
              <h2 style="color: #013A81;">Félicitations, ${userName} !</h2>
              <p>Votre adresse e-mail a été vérifiée avec succès. Votre compte AmCbunq est maintenant entièrement actif.</p>
              <p>Vous pouvez dès maintenant explorer toutes les fonctionnalités :</p>
              <ul style="list-style-type: none; padding-left: 0;">
                  <li style="margin-bottom: 10px;">✅ Commander votre carte bancaire physique ou virtuelle.</li>
                  <li style="margin-bottom: 10px;">✅ Effectuer des virements sécurisés.</li>
                  <li style="margin-bottom: 10px;">✅ Créer des budgets pour suivre vos dépenses.</li>
                  <li style="margin-bottom: 10px;">✅ Profiter de toutes nos offres promotionnelles.</li>
              </ul>
              <p>Connectez-vous pour découvrir tout ce que AmCbunq a à vous offrir.</p>
              <p style="margin-top: 20px;">
                  <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://mybunq.amccredit.com'}" style="background-color: #013A81; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Se connecter</a>
              </p>
              <p style="margin-top: 30px;">Merci,<br>L'équipe AmCbunq</p>
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
