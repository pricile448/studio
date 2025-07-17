
'use server';

/**
 * @fileOverview Flow to handle a KYC submission from a user.
 * This flow uses the Admin SDK to ensure it has the necessary permissions
 * to write to Firestore collections and sends a notification email.
 */
import type { AttachmentData } from 'mailgun.js';
import { getAdminDb } from '@/lib/firebase/admin';
import { collection, addDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { sendSupportEmail } from '@/lib/mailgun';
import type { KycEmailInput, KycSubmissionResult } from '@/lib/types';


export async function submitKyc(input: KycEmailInput): Promise<KycSubmissionResult> {
  try {
    const adminDb = getAdminDb(); // Use Admin SDK

    // 1. Create the KYC submission document in a dedicated collection.
    const submissionsCollectionRef = collection(adminDb as any, 'kycSubmissions');
    const submissionData = {
        userId: input.userId,
        userName: input.userName,
        userEmail: input.userEmail,
        status: 'pending' as const,
        submittedAt: Timestamp.now(),
    };
    await addDoc(submissionsCollectionRef, submissionData);
    
    // 2. Set the user's KYC status to 'pending' in their profile.
    const userDocRef = doc(adminDb as any, 'users', input.userId);
    await updateDoc(userDocRef, {
        kycStatus: 'pending',
        kycSubmittedAt: Timestamp.now(),
    });

    // 3. Send notification email with attachments to the admin.
    const adminEmail = process.env.MAILGUN_ADMIN_EMAIL;
    if (!adminEmail) {
        console.warn('MAILGUN_ADMIN_EMAIL is not set. Skipping admin notification email.');
        // We don't fail the whole process if the email is not configured.
        return { success: true, message: 'KYC soumis avec succès. La notification par email a été ignorée.' };
    }
  
    const emailSubject = `Nouvelle soumission KYC : ${input.userName}`;
    const emailBody = `
      Une nouvelle soumission KYC est prête pour examen.

      Utilisateur : ${input.userName} (${input.userEmail})
      ID Utilisateur : ${input.userId}
      
      Les documents sont joints à cet e-mail.
    `;

    const attachments: AttachmentData[] = [
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
      message: 'Votre demande de vérification a été envoyée avec succès.',
    };
  } catch (error: any) {
    console.error('Erreur lors du traitement de la soumission KYC:', error);
    return {
      success: false,
      message: 'Une erreur est survenue lors de la soumission de votre demande.',
      error: error.message || 'Une erreur inconnue est survenue.',
    };
  }
}
