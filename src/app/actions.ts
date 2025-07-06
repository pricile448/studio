
'use server';

import { uploadToCloudinary } from '@/services/cloudinary-service';

/**
 * A server action to upload a file to Cloudinary and return its secure URL.
 * This acts as a bridge between client components and the server-side Cloudinary service.
 * @param userId The ID of the user uploading the file.
 * @param dataUri The file encoded as a data URI.
 * @param folderType The type of folder to store the file in ('avatars' or 'documents').
 * @param originalFileName The original name of the file.
 * @returns An object with the upload status and URL or an error message.
 */
export async function getCloudinaryUrl(
    userId: string, 
    dataUri: string, 
    folderType: 'avatars' | 'documents', 
    originalFileName: string
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const folder = `user_${folderType}/${userId}`;
        // For avatars, create a unique name to avoid conflicts. For docs, use original name.
        const publicId = folderType === 'avatars' ? `avatar_${Date.now()}` : originalFileName;
        const url = await uploadToCloudinary(dataUri, folder, publicId);
        return { success: true, url };
    } catch (error: any) {
        console.error('Cloudinary upload action failed:', error);
        return { success: false, error: error.message };
    }
}
