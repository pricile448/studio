'use server';

/**
 * @fileOverview Flow to notify an administrator about a new KYC submission.
 */
import { z } from 'zod';
import { sendSupportEmail } from '@/lib/mailgun';

export const KycSubmissionInputSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string().email(),
  idDocumentUrl: z.string().url(),
  proofOfAddressUrl: z.string().url(),
  selfieUrl: z.string().url(),
});
export type KycSubmissionInput = z.infer<typeof KycSubmissionInputSchema>;

export const KycSubmissionResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  error: z.string().optional(),
});
export type KycSubmissionResult = z.infer<typeof KycSubmissionResultSchema>;

export async function notifyAdminOfKyc(input: KycSubmissionInput): Promise<KycSubmissionResult> {
  const adminEmail = process.env.MAILGUN_ADMIN_EMAIL;

  if (!adminEmail) {
    console.error('MAILGUN_ADMIN_EMAIL environment variable is not set.');
    return {
      success: false,
      message: 'Server configuration error.',
      error: 'The server is not configured to send emails for KYC notifications.',
    };
  }

  try {
    const emailSubject = `New KYC Submission: ${input.userName}`;
    const emailBody = `
      A new KYC submission is ready for review.

      User: ${input.userName} (${input.userEmail})
      User ID: ${input.userId}
      
      Documents:
      - ID Document: ${input.idDocumentUrl}
      - Proof of Address: ${input.proofOfAddressUrl}
      - Selfie: ${input.selfieUrl}
      
      Please review in the admin dashboard.
    `;

    await sendSupportEmail({
      to: adminEmail,
      from: process.env.MAILGUN_FROM_EMAIL || 'kyc@amcbunq.com',
      subject: emailSubject,
      text: emailBody,
    });

    return {
      success: true,
      message: 'Admin has been notified of the new KYC submission.',
    };
  } catch (error: any) {
    console.error('Failed to send KYC notification email:', error);
    return {
      success: false,
      message: 'Failed to send KYC notification.',
      error: error.message || 'An unknown error occurred while sending the email.',
    };
  }
}
