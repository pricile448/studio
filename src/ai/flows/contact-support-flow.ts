
'use server';
/**
 * @fileOverview A support request flow.
 *
 * This file exports:
 * - `contactSupport`: Handles the support request.
 * - `ContactSupportInput`: Input type for `contactSupport` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { sendEmail } from '@/services/mailgun-service';

const ContactSupportInputSchema = z.object({
  name: z.string().describe('The name of the person sending the request.'),
  email: z.string().email().describe('The email of the person sending the request.'),
  subject: z.string().describe('The subject of the support request.'),
  message: z.string().describe('The content of the support message.'),
});
export type ContactSupportInput = z.infer<typeof ContactSupportInputSchema>;

export async function contactSupport(input: ContactSupportInput): Promise<{success: boolean; error?: string}> {
  return contactSupportFlow(input);
}

const ADMIN_EMAIL = process.env.MAILGUN_ADMIN_EMAIL;

const contactSupportFlow = ai.defineFlow(
  {
    name: 'contactSupportFlow',
    inputSchema: ContactSupportInputSchema,
    outputSchema: z.object({ success: z.boolean(), error: z.string().optional() }),
  },
  async (input) => {
    if (!ADMIN_EMAIL) {
        const error = "MAILGUN_ADMIN_EMAIL is not set. Cannot send support email.";
        console.error(error);
        return { success: false, error: "Une erreur de configuration nous empêche d'envoyer l'e-mail." };
    }

    const emailText = `
    New support request received:
    Name: ${input.name}
    Email: ${input.email}
    Subject: ${input.subject}
    
    Message:
    ${input.message}
    `;

    try {
        await sendEmail({
            to: ADMIN_EMAIL,
            subject: `New Support Request: ${input.subject}`,
            text: emailText,
        });
        return { success: true };
    } catch (error: any) {
        console.error("Failed to send support email:", error);
        return { success: false, error: "Impossible d'envoyer votre message pour le moment. Veuillez réessayer plus tard." };
    }
  }
);
