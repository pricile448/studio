'use server';

import type { Attachment } from 'mailgun.js';
import { getFirestore } from 'firebase-admin/firestore';
import { collection, addDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { sendSupportEmail } from '@/lib/mailgun';

interface DocumentAttachment {
  filename: string;
  data: string;
}

interface KycEmailInput {
  userId: string;
  userName: string;
  userEmail: string;
  idDocument: DocumentAttachment;
  proofOfAddress: DocumentAttachment;
  selfie: DocumentAttachment;
}

interface KycSubmissionResult {
  success: boolean;
  message: string;
  error?: string;
}

export async function submitKyc(input: KycEmailInput): Promise<KycSubmissionResult> {
  try {
    // Validation des entrées
    if (!input.userId || !input.userEmail || !input.userName) {
      return { success: false, message: 'Les informations utilisateur sont incomplètes.' };
    }

    const adminDb = getFirestore();

    // 1. Création de la soumission KYC
    const submissionsCollectionRef = collection(adminDb, 'kycSubmissions');
    await addDoc(submissionsCollectionRef, {
      userId: input.userId,
      userName: input.userName,
      userEmail: input.userEmail,
      status: 'pending',
      submittedAt: Timestamp.now(),
    });
    
    // 2. Mise à jour du profil utilisateur
    const userDocRef = doc(adminDb, 'users', input.userId);
    await updateDoc(userDocRef, {
      kycStatus: 'pending',
      kycSubmittedAt: Timestamp.now(),
    });

    // 3. Envoi de l'email
    const adminEmail = process.env.MAILGUN_ADMIN_EMAIL;
    if (!adminEmail) {
      console.warn('MAILGUN_ADMIN_EMAIL non configuré');
      return { 
        success: true, 
        message: 'KYC soumis avec succès. Notification email ignorée.' 
      };
    }

    const attachments: Attachment[] = [
      {
        filename: input.idDocument.filename,
        data: Buffer.from(input.idDocument.data.split(",")[1], 'base64'),
        contentType: 'application/octet-stream'
      },
      // ... autres pièces jointes
    ];

    await sendSupportEmail({
      to: adminEmail,
      from: process.env.MAILGUN_FROM_EMAIL || 'kyc@amcbunq.com',
      subject: `Nouvelle soumission KYC : ${input.userName}`,
      text: `...`, // Votre template email
      attachments,
      template: 'kyc-notification'
    });

    return {
      success: true,
      message: 'Votre demande de vérification a été envoyée avec succès.',
    };
  } catch (error: unknown) {
    // Gestion d'erreur type-safe
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return {
      success: false,
      message: 'Échec de la soumission KYC',
      error: errorMessage
    };
  }
}