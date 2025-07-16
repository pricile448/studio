'use server';

import { v2 as cloudinary } from 'cloudinary';
import { getAdminDb } from '@/lib/firebase/admin';
import { collection, addDoc, Timestamp, doc, updateDoc } from 'firebase/firestore';
import type { KycEmailInput } from '@/lib/types';
import { sendSupportEmail } from '@/lib/mailgun';
import type Mailgun from 'mailgun.js';
import { db } from '@/lib/firebase/config';

export async function uploadChatAttachment(
  chatId: string,
  dataUri: string,
  fileName: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

  if (!isCloudinaryConfigured) {
    console.error('La configuration de Cloudinary est manquante.');
    return { success: false, error: 'La configuration du serveur pour les pièces jointes est incomplète.' };
  }

  cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: `chats/${chatId}`,
      public_id: fileName,
      resource_type: 'auto',
    });
    return { success: true, url: result.secure_url };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return { success: false, error: 'Failed to upload file to Cloudinary.' };
  }
}

export async function submitKycAndNotifyAdmin(input: KycEmailInput): Promise<{ success: boolean; error?: string }> {
  try {
    if (!db) {
        throw new Error("L'initialisation de la base de données a échoué.");
    }

    // 1. Create the KYC submission document in a dedicated collection.
    // This uses addDoc to auto-generate a unique ID, which is more secure.
    const submissionsCollectionRef = collection(db, 'kycSubmissions');
    const submissionData = {
        userId: input.userId,
        userName: input.userName,
        userEmail: input.userEmail,
        status: 'pending' as const,
        submittedAt: Timestamp.now(),
        // Note: We are not storing document URLs here anymore for simplicity,
        // as they are sent directly by email.
    };
    await addDoc(submissionsCollectionRef, submissionData);

    // 2. Set the user's KYC status to 'pending' in their profile.
    const userDocRef = doc(db, 'users', input.userId);
    await updateDoc(userDocRef, {
        kycStatus: 'pending'
    });

    // 3. Send notification email with attachments to the admin.
    const adminEmail = process.env.MAILGUN_ADMIN_EMAIL;
    if (!adminEmail) {
        const errorMsg = 'La variable d\'environnement MAILGUN_ADMIN_EMAIL n\'est pas définie.';
        console.error(errorMsg);
        // Even if email fails, the submission is saved. This is a configuration issue.
        // We return success for the user, but log the error for the admin.
        return { success: true };
    }
  
    const emailSubject = `Nouvelle soumission KYC : ${input.userName}`;
    const emailBody = `
      Une nouvelle soumission KYC est prête pour examen.

      Utilisateur : ${input.userName} (${input.userEmail})
      ID Utilisateur : ${input.userId}
      
      Les documents sont joints à cet e-mail.
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

    return { success: true };
  } catch (error: any) {
    console.error('Erreur lors du traitement de la soumission KYC:', error);
    // Provide a more generic error to the user for security.
    return { success: false, error: 'Une erreur est survenue lors de la soumission. Veuillez réessayer.' };
  }
}
