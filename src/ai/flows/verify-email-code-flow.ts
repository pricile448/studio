'use server';
/**
 * @fileOverview A flow to verify the 6-digit email verification code.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

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
      const userRef = doc(adminDb, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return { success: false, error: "Utilisateur non trouvé." };
      }

      const userData = userSnap.data();
      const storedCode = userData.emailVerificationCode;
      const expiry = userData.emailVerificationCodeExpires?.toDate();

      if (!storedCode || !expiry) {
        return { success: false, error: "Aucun code de vérification trouvé pour cet utilisateur." };
      }

      if (expiry < new Date()) {
        // Clear expired code
        await updateDoc(userRef, {
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
      await updateDoc(userRef, {
        emailVerificationCode: null,
        emailVerificationCodeExpires: null,
      });

      return { success: true };
    } catch (error: any) {
      console.error("Failed to verify email code:", error);
      return { success: false, error: error.message || "Échec de la vérification du code d'e-mail" };
    }
  }
);

export async function verifyEmailCode(input: VerifyEmailCodeInput): Promise<{ success: boolean; error?: string }> {
  return verifyEmailCodeFlow(input);
}
