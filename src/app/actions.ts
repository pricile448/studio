
'use server';

import { v2 as cloudinary } from 'cloudinary';
import { updateUserInFirestore } from '@/lib/firebase/firestore';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadChatAttachment(
  chatId: string,
  dataUri: string,
  fileName: string
): Promise<{ success: boolean; url?: string; error?: string }> {
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

export async function uploadKycDocumentsAction(data: {
    userId: string,
    idDocumentDataUri: string,
    proofOfAddressDataUri: string,
    selfieDataUri: string,
}) {
    const { userId, idDocumentDataUri, proofOfAddressDataUri, selfieDataUri } = data;

    try {
        const [idDocumentRes, proofOfAddressRes, selfieRes] = await Promise.all([
            cloudinary.uploader.upload(idDocumentDataUri, { folder: `kyc/${userId}` }),
            cloudinary.uploader.upload(proofOfAddressDataUri, { folder: `kyc/${userId}` }),
            cloudinary.uploader.upload(selfieDataUri, { folder: `kyc/${userId}` })
        ]);

        const kycDocuments = {
            idDocumentUrl: idDocumentRes.secure_url,
            proofOfAddressUrl: proofOfAddressRes.secure_url,
            selfieUrl: selfieRes.secure_url,
        };

        await updateUserInFirestore(userId, {
            kycStatus: 'pending',
            kycDocuments,
            kycSubmittedAt: new Date(),
        });

        return { success: true, ...kycDocuments };

    } catch (error) {
        console.error("Erreur lors du téléversement des documents KYC:", error);
        return { success: false, error: "Le téléversement des documents a échoué." };
    }
}
