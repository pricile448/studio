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

  // Configure Cloudinary within the function call to ensure it's always set correctly.
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });

  try {
    // Set resource_type to 'auto' to let Cloudinary automatically detect
    // the file type (image, video, raw for PDFs/docs). This is the most robust method.
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: folder,
      resource_type: 'auto',
    });
    return result.secure_url;
  } catch (error: any) {
    // Log the full error to the server console for detailed debugging
    console.error('Detailed Cloudinary Upload Error:', JSON.stringify(error, null, 2));

    // Propagate a more helpful error message to the client
    const errorMessage = error.message || (error.error && error.error.message) || 'An unknown error occurred during Cloudinary upload.';
    throw new Error(`Cloudinary Error: ${errorMessage}`);
  }
}
