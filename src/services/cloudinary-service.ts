
'use server';
/**
 * @fileOverview Cloudinary service for uploading files.
 * This file exports a function to upload data URIs to Cloudinary.
 */

import { v2 as cloudinary } from 'cloudinary';

/**
 * Uploads a file from a data URI to Cloudinary.
 * @param dataUri The data URI of the file to upload.
 * @param folder The folder in Cloudinary to upload the file to.
 * @returns The secure URL of the uploaded file.
 */
export async function uploadToCloudinary(dataUri: string, folder: string): Promise<string> {
  const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
  const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    const errorMsg = 'Cloudinary environment variables are not set. Cannot upload file.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });

  const mimeTypeMatch = dataUri.match(/data:(.*);base64/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'application/octet-stream';
  
  const resource_type = mimeType.startsWith('image/') ? 'image' : 'raw';

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: folder,
      resource_type: resource_type,
      use_filename: true,
      unique_filename: true, 
      overwrite: false
    });
    return result.secure_url;
  } catch (error: any) {
    console.error('Detailed Cloudinary Upload Error:', JSON.stringify(error, null, 2));

    const errorMessage = error.message || (error.error && error.error.message) || 'An unknown error occurred during Cloudinary upload.';
    throw new Error(`Cloudinary Error: ${errorMessage}`);
  }
}
