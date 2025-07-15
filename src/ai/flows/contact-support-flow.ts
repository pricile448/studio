'use server';

/**
 * @fileOverview Flow to handle a support contact request from a user.
 */

import { z } from 'zod';
import { sendSupportEmail } from '@/lib/mailgun';

export const ContactSupportInputSchema = z.object({
  name: z.string().describe('The name of the user.'),
  email: z.string().email().describe('The email address of the user.'),
  subject: z.string().describe('The subject of the support request.'),
  message: z.string().describe('The content of the support message.'),
});
export type ContactSupportInput = z.infer<typeof ContactSupportInputSchema>;

export const ContactSupportResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  error: z.string().optional(),
});
export type ContactSupportResult = z.infer<typeof ContactSupportResultSchema>;

export async function contactSupport(input: ContactSupportInput): Promise<ContactSupportResult> {
  const adminEmail = process.env.MAILGUN_ADMIN_EMAIL;

  if (!adminEmail) {
    console.error('MAILGUN_ADMIN_EMAIL environment variable is not set.');
    return {
      success: false,
      message: 'Server configuration error.',
      error: 'The server is not configured to send emails.',
    };
  }

  try {
    const emailSubject = `Support Request: ${input.subject}`;
    const emailBody = `
      You have received a new support request.

      From: ${input.name} (${input.email})
      Subject: ${input.subject}
      
      Message:
      -----------------
      ${input.message}
      -----------------
    `;

    await sendSupportEmail({
      to: adminEmail,
      from: process.env.MAILGUN_FROM_EMAIL || 'support@amcbunq.com',
      subject: emailSubject,
      text: emailBody,
    });

    return {
      success: true,
      message: 'Your support request has been sent successfully.',
    };
  } catch (error: any) {
    console.error('Failed to send support email:', error);
    return {
      success: false,
      message: 'Failed to send support request.',
      error: error.message || 'An unknown error occurred while sending the email.',
    };
  }
}
