'use server';

import { v2 as cloudinary } from 'cloudinary';
import { getAdminDb } from '@/lib/firebase/admin';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import type { KycEmailInput } from '@/lib/types';
import { sendSupportEmail } from '@/lib/mailgun';
import type Mailgun from 'mailgun.js';

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
    // Utiliser le SDK Admin car cette action est exécutée côté serveur.
    // Cela garantit les permissions nécessaires, indépendantes de la session client.
    const adminDb = getAdminDb();

    // 1. Create the KYC submission document in Firestore using addDoc for an auto-generated ID
    const submissionsCollectionRef = collection(adminDb, 'kycSubmissions');
    const submissionData = {
        userId: input.userId,
        userName: input.userName,
        userEmail: input.userEmail,
        status: 'pending' as const,
        submittedAt: Timestamp.now(),
    };

    await addDoc(submissionsCollectionRef, submissionData);

    // 2. Send notification email with attachments
    const adminEmail = process.env.MAILGUN_ADMIN_EMAIL;
    if (!adminEmail) {
        const errorMsg = 'La variable d\'environnement MAILGUN_ADMIN_EMAIL n\'est pas définie.';
        console.error(errorMsg);
        return { success: false, error: 'Erreur de configuration du serveur.' };
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
    return { success: false, error: error.message || 'Une erreur inconnue est survenue.' };
  }
}
