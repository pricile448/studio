
'use server';
/**
 * @fileOverview A flow for handling secure internal money transfers.
 *
 * This file exports:
 * - `performSecureTransfer`: The main function to call for transfers.
 * - `InternalTransferInput`: The input type for the transfer function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { getFirebaseServices } from '@/lib/firebase/config';
import type { Account } from '@/lib/firebase/firestore';

// Use the admin database instance for secure server-side operations
const { db: adminDb } = getFirebaseServices('admin');

const InternalTransferInputSchema = z.object({
  userId: z.string().describe('The ID of the user performing the transfer.'),
  fromAccountId: z.string().describe('The ID of the account to transfer from.'),
  toAccountId: z.string().describe('The ID of the account to transfer to.'),
  amount: z.number().positive().describe('The amount to transfer.'),
});
export type InternalTransferInput = z.infer<typeof InternalTransferInputSchema>;

// This is the exported function that the client will call.
export async function performSecureTransfer(input: InternalTransferInput): Promise<{ success: boolean; error?: string }> {
  return internalTransferFlow(input);
}

// This is the Genkit flow definition.
const internalTransferFlow = ai.defineFlow(
  {
    name: 'internalTransferFlow',
    inputSchema: InternalTransferInputSchema,
    outputSchema: z.object({ success: z.boolean(), error: z.string().optional() }),
  },
  async (input) => {
    const { userId, fromAccountId, toAccountId, amount } = input;
    const userRef = doc(adminDb, "users", userId);

    try {
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            throw new Error("Utilisateur non trouvé.");
        }

        const userData = userSnap.data();
        const accounts: Account[] = userData.accounts || [];

        const fromAccountIndex = accounts.findIndex(acc => acc.id === fromAccountId);
        const toAccountIndex = accounts.findIndex(acc => acc.id === toAccountId);

        if (fromAccountIndex === -1 || toAccountIndex === -1) {
            throw new Error("Un ou plusieurs comptes sont introuvables.");
        }
        
        if (accounts[fromAccountIndex].balance < amount) {
            throw new Error("Solde insuffisant sur le compte de départ.");
        }

        // Update balances
        accounts[fromAccountIndex].balance -= amount;
        accounts[toAccountIndex].balance += amount;
        
        // Create transactions
        const now = Timestamp.now();
        const fromAccountName = accounts[fromAccountIndex].name === 'checking' ? 'Compte Courant' : (accounts[fromAccountIndex].name === 'savings' ? 'Compte Épargne' : 'Carte de Crédit');
        const toAccountName = accounts[toAccountIndex].name === 'checking' ? 'Compte Courant' : (accounts[toAccountIndex].name === 'savings' ? 'Compte Épargne' : 'Carte de Crédit');

        const debitTransaction = {
            id: `txn_d_${Date.now()}`,
            accountId: fromAccountId,
            date: now,
            description: `Virement vers ${toAccountName}`,
            amount: -amount,
            currency: 'EUR',
            category: 'Virement interne',
            status: 'completed'
        };
        
        const creditTransaction = {
            id: `txn_c_${Date.now()}`,
            accountId: toAccountId,
            date: now,
            description: `Virement depuis ${fromAccountName}`,
            amount: amount,
            currency: 'EUR',
            category: 'Virement interne',
            status: 'completed'
        };

        const transactions = userData.transactions ? [...userData.transactions, debitTransaction, creditTransaction] : [debitTransaction, creditTransaction];
        
        await updateDoc(userRef, {
            accounts: accounts,
            transactions: transactions
        });

        return { success: true };

    } catch (error: any) {
      console.error("Internal Transfer Flow Error:", error);
      return { success: false, error: error.message || "Une erreur inconnue est survenue lors du virement." };
    }
  }
);
