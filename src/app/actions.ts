'use server';

import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { adminDb } from '@/lib/firebase/admin';
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { updateUserInFirestore, type Document } from '@/lib/firebase/firestore';


// Configure Cloudinary
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
        secure: true,
    });
} else {
    console.warn(
        'Cloudinary environment variables are not fully set. File uploads will be disabled.'
    );
}

// Internal helper function for uploading
async function internalUploadToCloudinary(dataUri: string, folder: string, originalFileName: string): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    const errorMsg = 'Cloudinary environment variables are not set. Cannot upload file.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const mimeType = dataUri.substring(dataUri.indexOf(':') + 1, dataUri.indexOf(';'));
  const resourceType = mimeType.startsWith('image/') ? 'image' : 'raw';
  const fileNameWithoutExt = originalFileName.substring(0, originalFileName.lastIndexOf('.')) || originalFileName;

  try {
    const result: UploadApiResponse = await cloudinary.uploader.upload(dataUri, {
      folder: folder,
      resource_type: resourceType,
      public_id: fileNameWithoutExt,
      overwrite: false,
    });
    return result.secure_url;
  } catch (error: any) {
    console.error('Detailed Cloudinary Upload Error:', JSON.stringify(error, null, 2));
    const errorMessage = error.message || (error.error && error.error.message) || 'An unknown error occurred during Cloudinary upload.';
    throw new Error(`Cloudinary Error: ${errorMessage}`);
  }
}

/**
 * Server action for single file uploads (e.g., avatars).
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
        const url = await internalUploadToCloudinary(dataUri, folder, publicId);
        return { success: true, url };
    } catch (error: any) {
        console.error('Cloudinary upload action failed:', error);
        return { success: false, error: error.message };
    }
}


/**
 * Server action for uploading KYC documents.
 */
interface KycUploadInput {
  userId: string;
  idDocumentDataUri: string;
  proofOfAddressDataUri: string;
  selfieDataUri: string;
}

interface KycUploadOutput {
  success: boolean;
  idDocumentUrl?: string;
  proofOfAddressUrl?: string;
  selfieUrl?: string;
  error?: string;
}

export async function uploadKycDocumentsAction(input: KycUploadInput): Promise<KycUploadOutput> {
    const { userId, idDocumentDataUri, proofOfAddressDataUri, selfieDataUri } = input;
    const uploadFolder = `kyc_documents/${userId}`;
    
    try {
        const [idDocumentUrl, proofOfAddressUrl, selfieUrl] = await Promise.all([
            internalUploadToCloudinary(idDocumentDataUri, uploadFolder, 'identity_document'),
            internalUploadToCloudinary(proofOfAddressDataUri, uploadFolder, 'proof_of_address'),
            internalUploadToCloudinary(selfieDataUri, uploadFolder, 'selfie_photo'),
        ]);
        return { success: true, idDocumentUrl, proofOfAddressUrl, selfieUrl };
    } catch (error: any) {
        console.error('KYC documents upload action failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Server action for uploading chat attachments.
 */
export async function uploadChatAttachment(
    chatId: string, 
    dataUri: string,
    originalFileName: string
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const folder = `chat_attachments/${chatId}`;
        const url = await internalUploadToCloudinary(dataUri, folder, originalFileName);
        return { success: true, url };
    } catch (error: any) {
        console.error('Chat attachment upload action failed:', error);
        return { success: false, error: error.message };
    }
}


/**
 * Server action to save a document's URL to a user's profile.
 */
export async function addDocumentToProfile(userId: string, documentName: string, url: string): Promise<{ success: boolean; error?: string }> {
    if (!adminDb) {
        return { success: false, error: 'Admin DB not initialized.' };
    }
    try {
        const userRef = doc(adminDb, "users", userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error("User not found");
        }

        const newDocument: Omit<Document, 'createdAt'> & {createdAt: Timestamp} = {
            id: `doc_${Date.now()}`,
            name: documentName,
            url: url,
            createdAt: Timestamp.now()
        };

        const currentDocs = userSnap.data().documents || [];
        const updatedDocuments = [...currentDocs, newDocument];

        await updateUserInFirestore(userId, { documents: updatedDocuments }, adminDb);
        return { success: true };
    } catch (error: any) {
        console.error('Failed to add document to profile:', error);
        return { success: false, error: error.message };
    }
}
