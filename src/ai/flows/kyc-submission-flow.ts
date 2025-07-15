
'use server';

/**
 * @fileOverview Flow to handle a KYC submission, create the submission document,
 * update the user's status, and notify an administrator.
 */
import { sendSupportEmail } from '@/lib/mailgun';
import type { KycEmailInput, KycSubmissionResult } from '@/lib/types';
import Mailgun from 'mailgun.js';
import { getAdminDb } from '@/lib/firebase/admin';
import { doc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';


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
    const adminDb = getAdminDb();
    
    // 1. Create the KYC submission document in Firestore
    const submissionRef = doc(adminDb, 'kycSubmissions', input.userId);
    const submissionData = {
        userId: input.userId,
        userName: input.userName,
        userEmail: input.userEmail,
        status: 'pending' as const,
        submittedAt: Timestamp.now(),
    };
    await setDoc(submissionRef, submissionData, { merge: true });

    // 2. Update the user's KYC status
    const userRef = doc(adminDb, 'users', input.userId);
    await updateDoc(userRef, {
        kycStatus: 'pending',
        kycSubmittedAt: Timestamp.now(),
    });


    // 3. Send notification email with attachments
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
      message: 'KYC submission successful and admin has been notified.',
    };
  } catch (error: any) {
    console.error('Failed to process KYC submission:', error);
    return {
      success: false,
      message: 'Failed to process KYC submission.',
      error: error.message || 'An unknown error occurred.',
    };
  }
}
