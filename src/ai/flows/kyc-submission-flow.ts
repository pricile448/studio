
'use server';

/**
 * @fileOverview Flow to notify an administrator about a new KYC submission.
 */
import { sendSupportEmail } from '@/lib/mailgun';
import type { KycEmailInput, KycSubmissionResult } from '@/lib/types';
import Mailgun from 'mailgun.js';

export async function submitKycAndNotifyAdmin(input: KycEmailInput): Promise<KycSubmissionResult> {
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
      
      The documents are attached to this email.
    `;

    const attachments: Mailgun.AttachmentData[] = [
        { filename: input.idDocument.filename, data: Buffer.from(input.idDocument.data.split(",")[1], 'base64') },
        { filename: input.proofOfAddress.filename, data: Buffer.from(input.proofOfAddress.data.split(",")[1], 'base64') },
        { filename: input.selfie.filename, data: Buffer.from(input.selfie.data.split(",")[1], 'base64') }
    ];

    await sendSupportEmail({
      to: adminEmail,
      from: process.env.MAILGUN_FROM_EMAIL || 'kyc@amcbunq.com',
      subject: emailSubject,
      text: emailBody,
      attachment: attachments,
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
