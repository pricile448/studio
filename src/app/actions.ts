'use server';

import { v2 as cloudinary } from 'cloudinary';

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
