import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Transforms a Cloudinary URL into a forced download URL.
 * @param url The original Cloudinary URL.
 * @param filename The desired filename for the download.
 * @returns A new URL that forces the browser to download the file.
 */
export function getCloudinaryDownloadUrl(url: string, filename?: string): string {
  if (!url || !url.includes('/upload/')) {
    return url; // Return original URL if it's not a standard Cloudinary upload URL
  }
  
  const urlParts = url.split('/upload/');
  const baseUrl = urlParts[0];
  const path = urlParts[1];
  
  // Using fl_attachment forces download. Appending the filename suggests a name to the browser.
  const attachmentFlag = filename ? `fl_attachment:${encodeURIComponent(filename)}` : 'fl_attachment';
  
  return `${baseUrl}/upload/${attachmentFlag}/${path}`;
}
