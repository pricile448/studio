
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

const ContactSupportInputSchema = z.object({
  name: z.string().describe('The name of the person sending the request.'),
  email: z.string().email().describe('The email of the person sending the request.'),
  subject: z.string().describe('The subject of the support request.'),
  message: z.string().describe('The content of the support message.'),
});
export type ContactSupportInput = z.infer<typeof ContactSupportInputSchema>;

export async function contactSupport(input: ContactSupportInput): Promise<{success: boolean}> {
  return contactSupportFlow(input);
}

const contactSupportFlow = ai.defineFlow(
  {
    name: 'contactSupportFlow',
    inputSchema: ContactSupportInputSchema,
    outputSchema: z.object({ success: z.boolean() }),
  },
  async (input) => {
    // In a real application, you would integrate an email service like SendGrid or Mailgun here.
    // For this prototype, we'll just log the request to the console.
    console.log('New support request received:');
    console.log('Name:', input.name);
    console.log('Email:', input.email);
    console.log('Subject:', input.subject);
    console.log('Message:', input.message);
    
    // Simulate a successful submission
    return { success: true };
  }
);
