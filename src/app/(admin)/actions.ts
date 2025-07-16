'use server';

/**
 * Server actions for the admin panel.
 * These functions use the Admin SDK and are safe to be called from client components.
 */
import { getAdminDb } from '@/lib/firebase/admin';
import { deleteChatSession, hardDeleteMessage } from '@/lib/firebase/firestore';

export async function resetConversation(chatId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const adminDb = getAdminDb();
        await deleteChatSession(chatId, adminDb);
        return { success: true };
    } catch (error: any) {
        console.error("Error resetting conversation:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteAdminMessage(chatId: string, messageId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const adminDb = getAdminDb();
        await hardDeleteMessage(chatId, messageId, adminDb);
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting admin message:", error);
        return { success: false, error: error.message };
    }
}
