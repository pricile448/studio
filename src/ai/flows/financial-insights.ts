// src/ai/flows/financial-insights.ts
'use server';
/**
 * @fileOverview AI-powered financial insights flow.
 *
 * This file exports:
 * - `getFinancialInsights`: Analyzes transaction history to provide personalized financial insights.
 * - `FinancialInsightsInput`: Input type for `getFinancialInsights` function.
 * - `FinancialInsightsOutput`: Output type for `getFinancialInsights` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TransactionSchema = z.object({
  date: z.string().describe('The date of the transaction (YYYY-MM-DD).'),
  description: z.string().describe('A brief description of the transaction.'),
  amount: z.number().describe('The transaction amount (positive for income, negative for expense).'),
  category: z.string().describe('The category of the transaction (e.g., food, transportation, entertainment).'),
});

const FinancialInsightsInputSchema = z.object({
  transactionHistory: z.array(TransactionSchema).describe('The user\'s transaction history.'),
  income: z.number().describe('The user\'s monthly income.'),
  expenses: z.number().describe('The user\'s monthly expenses.'),
});

export type FinancialInsightsInput = z.infer<typeof FinancialInsightsInputSchema>;

const FinancialInsightsOutputSchema = z.object({
  insights: z.array(z.string()).describe('An array of financial insights and recommendations.'),
  overspendingDetected: z.boolean().describe('Whether overspending was detected in any category.'),
  savingsOpportunitiesDetected: z.boolean().describe('Whether savings opportunities were detected.'),
});

export type FinancialInsightsOutput = z.infer<typeof FinancialInsightsOutputSchema>;

export async function getFinancialInsights(input: FinancialInsightsInput): Promise<FinancialInsightsOutput> {
  return financialInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'financialInsightsPrompt',
  input: {schema: FinancialInsightsInputSchema},
  output: {schema: FinancialInsightsOutputSchema},
  prompt: `You are a personal financial advisor. Analyze the user's transaction history and provide personalized financial insights and recommendations.

Transaction History:
{{#each transactionHistory}}
  - Date: {{date}}, Description: {{description}}, Amount: {{amount}}, Category: {{category}}
{{/each}}

Monthly Income: {{income}}
Monthly Expenses: {{expenses}}

Based on this information, identify potential overspending or savings opportunities and provide actionable recommendations. Set overspendingDetected and savingsOpportunitiesDetected to true if you find any.

Format your insights as a list of concise bullet points.
`,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const financialInsightsFlow = ai.defineFlow(
  {
    name: 'financialInsightsFlow',
    inputSchema: FinancialInsightsInputSchema,
    outputSchema: FinancialInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
