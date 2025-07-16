'use server';

/**
 * Server actions for the admin panel.
 * These functions use the Admin SDK and are safe to be called from client components.
 */
import { getAdminDb } from '@/lib/firebase/admin';
import { deleteChatSession, hardDeleteMessage, getAllKycSubmissions as getAllKycSubmissionsFromDb, updateUserInFirestore } from '@/lib/firebase/firestore';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

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

export async function fetchKycSubmissions() {
    try {
        const adminDb = getAdminDb();
        const submissions = await getAllKycSubmissionsFromDb(adminDb);
        // Convert Date objects to ISO strings for serialization
        return { success: true, data: JSON.parse(JSON.stringify(submissions)) };
    } catch (error: any) {
        console.error("Error fetching KYC submissions:", error);
        return { success: false, error: error.message };
    }
}

export async function updateKycStatus(userId: string, submissionId: string, newStatus: 'approved' | 'rejected') {
    try {
        const adminDb = getAdminDb();
        const submissionRef = doc(adminDb, 'kycSubmissions', submissionId);
        await updateDoc(submissionRef, { status: newStatus, processedAt: serverTimestamp() });

        if (newStatus === 'approved') {
            await updateUserInFirestore(userId, { kycStatus: 'verified' }, adminDb);
        }
        
        return { success: true };
    } catch (error: any) {
        console.error("Error updating KYC status:", error);
        return { success: false, error: error.message };
    }
}