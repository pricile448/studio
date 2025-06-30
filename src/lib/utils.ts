import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Constructs a Cloudinary URL that forces a download.
 * @param url The original Cloudinary URL.
 * @param filename The desired filename for the download.
 * @returns A new URL with the attachment flag.
 */
export function getCloudinaryDownloadUrl(url: string, filename?: string): string {
    if (!url || !url.includes('/upload/')) {
        return url; // Return original URL if it's not a standard Cloudinary upload URL
    }
    const parts = url.split('/upload/');
    // Sanitize filename to prevent URL injection issues
    const sanitizedFilename = filename?.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const attachmentFlag = sanitizedFilename ? `fl_attachment:${sanitizedFilename}` : 'fl_attachment';
    return `${parts[0]}/upload/${attachmentFlag}/${parts[1]}`;
}
