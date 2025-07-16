
'use server';

/**
 * Server actions for the admin panel.
 * These functions use the Admin SDK and are safe to be called from client components.
 */
import { getAdminDb } from '@/lib/firebase/admin';
import { deleteChatSession, hardDeleteMessage, getAllKycSubmissions as getAllKycSubmissionsFromDb, updateUserInFirestore, getAllTransfers, executeTransfer, updateTransferStatus, getAllUsers } from '@/lib/firebase/firestore';
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

export async function fetchAllUsers() {
    try {
        const adminDb = getAdminDb();
        const users = await getAllUsers(adminDb);
        return { success: true, data: JSON.parse(JSON.stringify(users)) };
    } catch (error: any) {
        console.error("Error fetching users:", error);
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

export async function fetchAllTransfers() {
    try {
        const adminDb = getAdminDb();
        const transfers = await getAllTransfers(adminDb);
        return { success: true, data: JSON.parse(JSON.stringify(transfers)) };
    } catch (error: any) {
        console.error("Error fetching transfers:", error);
        return { success: false, error: error.message };
    }
}

export async function updateTransferStatusAction(userId: string, transactionId: string, newStatus: 'in_progress' | 'failed' | 'in_review') {
    try {
        const adminDb = getAdminDb();
        await updateTransferStatus(userId, transactionId, newStatus, adminDb);
        return { success: true };
    } catch (error: any) {
        console.error("Error updating transfer status:", error);
        return { success: false, error: error.message };
    }
}

export async function executeTransferAction(userId: string, transactionId: string) {
    try {
        const adminDb = getAdminDb();
        await executeTransfer(userId, transactionId, adminDb);
        return { success: true };
    } catch (error: any) {
        console.error("Error executing transfer:", error);
        return { success: false, error: error.message };
    }
}
