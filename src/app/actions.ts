'use server';

import { v2 as cloudinary } from 'cloudinary';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';

// Configure Cloudinary
const isCloudinaryConfigured = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

if (isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

async function uploadFile(
  path: string,
  dataUri: string,
  fileName: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!isCloudinaryConfigured) {
    const errorMsg = 'La configuration de Cloudinary est manquante.';
    console.error(errorMsg);
    return { success: false, error: 'La configuration du serveur pour les pièces jointes est incomplète.' };
  }

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: path,
      public_id: fileName,
      resource_type: 'auto',
    });
    return { success: true, url: result.secure_url };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return { success: false, error: 'Failed to upload file to Cloudinary.' };
  }
}

export async function getCloudinaryUrl(
  userId: string,
  dataUri: string,
  folder: string,
  fileName: string
): Promise<{ success: boolean; url?: string; error?: string }> {
    return uploadFile(`users/${userId}/${folder}`, dataUri, fileName);
}

export async function addDocumentToProfile(
    userId: string,
    documentName: string,
    documentUrl: string
): Promise<{ success: boolean; error?: string }> {
    if (!userId || !db) {
        return { success: false, error: 'User not authenticated or DB not initialized' };
    }
    try {
        const userRef = doc(db, 'users', userId);
        const newDocument = {
            id: `doc_${Date.now()}`,
            name: documentName,
            url: documentUrl,
            createdAt: Timestamp.now(),
        };
        await updateDoc(userRef, { documents: arrayUnion(newDocument) });
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}


export async function uploadChatAttachment(
  chatId: string,
  dataUri: string,
  fileName: string
): Promise<{ success: boolean; url?: string; error?: string }> {
    return uploadFile(`chats/${chatId}`, dataUri, fileName);
}
