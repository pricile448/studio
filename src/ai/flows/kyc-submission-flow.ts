'use server';

/**
 * @fileOverview Flow to notify an administrator about a new KYC submission.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const KycSubmissionInputSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string(),
  idDocumentUrl: z.string().url(),
  proofOfAddressUrl: z.string().url(),
  selfieUrl: z.string().url(),
});
export type KycSubmissionInput = z.infer<typeof KycSubmissionInputSchema>;

export const KycSubmissionResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type KycSubmissionResult = z.infer<typeof KycSubmissionResultSchema>;

export async function notifyAdminOfKyc(input: KycSubmissionInput): Promise<KycSubmissionResult> {
  return kycSubmissionFlow(input);
}

const kycSubmissionFlow = ai.defineFlow(
  {
    name: 'kycSubmissionFlow',
    inputSchema: KycSubmissionInputSchema,
    outputSchema: KycSubmissionResultSchema,
  },
  async (input) => {
    console.log(`New KYC Submission from ${input.userName} (${input.userEmail}).`);
    
    // In a real-world scenario, you would integrate an email or notification service here.
    // For now, we'll just log it and return a success message.
    
    // Example: Sending an email using a hypothetical email service
    /*
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New KYC Submission: ${input.userName}`,
      body: `
        A new KYC submission is ready for review.
        User: ${input.userName} (${input.userEmail})
        User ID: ${input.userId}
        
        Documents:
        - ID: ${input.idDocumentUrl}
        - Proof of Address: ${input.proofOfAddressUrl}
        - Selfie: ${input.selfieUrl}
        
        Please review in the admin dashboard.
      `
    });
    */

    return {
      success: true,
      message: `Admin notification for KYC submission from ${input.userName} processed.`,
    };
  }
);
