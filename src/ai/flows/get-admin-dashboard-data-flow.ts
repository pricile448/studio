'use server';

/**
 * @fileOverview Flow to retrieve data for the admin dashboard.
 * - getAdminDashboardData - Fetches stats and recent activity.
 */

import { z } from 'zod';
import { getAdmins, getAllUsers, getAllKycSubmissions } from '@/lib/firebase/firestore';
import { adminDb } from '@/lib/firebase/admin';

export const AdminDashboardDataSchema = z.object({
    stats: z.object({
        totalUsers: z.number(),
        pendingKyc: z.number(),
        approvedKyc: z.number(),
        rejectedKyc: z.number(),
    }),
    recentActivity: z.array(z.object({
        id: z.string(),
        type: z.enum(['user', 'kyc']),
        timestamp: z.string(), // ISO 8601 string
        data: z.any(),
    })),
    admins: z.array(z.any()),
});
export type AdminDashboardData = z.infer<typeof AdminDashboardDataSchema>;

export const AdminDashboardDataResultSchema = z.object({
    success: z.boolean(),
    data: AdminDashboardData.optional(),
    error: z.string().optional(),
});
export type AdminDashboardDataResult = z.infer<typeof AdminDashboardDataResultSchema>;

export async function getAdminDashboardData(): Promise<AdminDashboardDataResult> {
    try {
        const [users, kycSubmissions, admins] = await Promise.all([
            getAllUsers(adminDb),
            getAllKycSubmissions(adminDb),
            getAdmins(adminDb)
        ]);

        const stats = {
            totalUsers: users.length,
            pendingKyc: kycSubmissions.filter(s => s.status === 'pending').length,
            approvedKyc: kycSubmissions.filter(s => s.status === 'approved').length,
            rejectedKyc: kycSubmissions.filter(s => s.status === 'rejected').length,
        };

        const recentUsers = users
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 5)
            .map(user => ({
                id: user.uid,
                type: 'user' as const,
                timestamp: user.createdAt,
                data: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    photoURL: user.photoURL,
                },
            }));

        const recentKyc = kycSubmissions
            .filter(kyc => kyc.status === 'pending')
            .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
            .slice(0, 5)
            .map(kyc => ({
                id: kyc.uid,
                type: 'kyc' as const,
                timestamp: kyc.submittedAt,
                data: {
                    userName: kyc.userName,
                },
            }));
        
        const recentActivity = [...recentUsers, ...recentKyc]
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 5)
            .map(item => ({ ...item, timestamp: item.timestamp.toISOString() }));

        return {
            success: true,
            data: { stats, recentActivity, admins },
        };

    } catch (error: any) {
        console.error("Error in getAdminDashboardData:", error);
        // Check for specific error indicating missing service account JSON
        if (error.message.includes('SERVICE_ACCOUNT_JSON')) {
            return {
                success: false,
                error: `La configuration du SDK Admin Firebase est incomplète. Assurez-vous que la variable d'environnement SERVICE_ACCOUNT_JSON est correctement définie.`,
            };
        }
        return {
            success: false,
            error: error.message || 'Une erreur inconnue est survenue lors de la récupération des données.',
        };
    }
}
