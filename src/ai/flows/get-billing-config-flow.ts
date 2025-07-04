
'use server';
/**
 * @fileOverview A flow to securely retrieve the billing configuration.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getBillingConfig, type BillingConfig } from '@/lib/firebase/firestore';

// Define the output schema based on the existing BillingConfig type
const BillingConfigSchema = z.object({
  isEnabled: z.boolean(),
  holder: z.string(),
  iban: z.string(),
  bic: z.string(),
  description: z.string(),
});
export type BillingConfigOutput = z.infer<typeof BillingConfigSchema>;

// The wrapper function that the client-facing server component will call.
export async function getBillingConfigFlow(): Promise<BillingConfigOutput | null> {
  // Since Genkit flows on the server run in a trusted environment (like a Cloud Function),
  // they can access Firestore with admin privileges, bypassing security rules.
  return getBillingConfigFlowInternal();
}

// The Genkit flow definition.
const getBillingConfigFlowInternal = ai.defineFlow(
  {
    name: 'getBillingConfigFlow',
    inputSchema: z.void(), // No input
    outputSchema: z.nullable(BillingConfigSchema),
  },
  async () => {
    const config = await getBillingConfig();
    return config;
  }
);
