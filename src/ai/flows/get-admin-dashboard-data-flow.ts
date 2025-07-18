'use server';

/**
 * @fileOverview Flow pour récupérer les données du tableau de bord admin.
 * - getAdminDashboardData : récupère les stats et l'activité récente.
 */

import { getAdmins, getAllUsers, getAllKycSubmissions } from '@/lib/firebase/firestore';
import { getAdminDb } from '@/lib/firebase/admin';
import type { AdminDashboardDataResult } from '@/lib/types';

export async function getAdminDashboardData(): Promise<AdminDashboardDataResult> {
    try {
        const adminDb = getAdminDb();
        const [users, kycSubmissions, rawUserProfiles] = await Promise.all([
            getAllUsers(adminDb as any),
            getAllKycSubmissions(adminDb as any),
            getAdmins(adminDb as any)
        ]);

        // 📊 Statistiques globales
        const stats = {
            totalUsers: users.length,
            pendingKyc: kycSubmissions.filter(s => s.status === 'pending').length,
            approvedKyc: kycSubmissions.filter(s => s.status === 'approved').length,
            rejectedKyc: kycSubmissions.filter(s => s.status === 'rejected').length,
        };

        // 👥 Derniers utilisateurs
        const recentUsers = users
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 5)
            .map(user => ({
                id: user.uid,
                type: 'user' as const,
                timestamp: user.createdAt,
                status: 'unknown', // 👈 Ajouté pour satisfaire le type
                user: `${user.firstName} ${user.lastName}` || 'Utilisateur inconnu',
                data: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    photoURL: user.photoURL,
                },
            }));

        // 🧾 Demandes KYC récentes
        const recentKyc = kycSubmissions
            .filter(kyc => kyc.status === 'pending')
            .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
            .slice(0, 5)
            .map(kyc => ({
                id: kyc.uid,
                type: 'kyc' as const,
                timestamp: kyc.submittedAt,
                status: kyc.status || 'pending',
                user: kyc.userName || 'Utilisateur inconnu',
                data: {
                    userName: kyc.userName,
                },
            }));

        // 🕒 Activité récente (fusionnée, triée et formatée)
        const recentActivity = [...recentUsers, ...recentKyc]
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 5)
            .map(item => ({
                ...item,
                timestamp: item.timestamp.toISOString(), // ⏱️ Format ISO
            }));

        // 👮‍♂️ Admins transformés dans le bon format
        const admins = rawUserProfiles.map(profile => ({
            email: profile.email,
            id: profile.uid,
            role: profile.role || 'user',
            lastLogin: profile.lastLogin ? profile.lastLogin.toISOString() : undefined,
        }));

        return {
            success: true,
            data: {
                stats,
                recentActivity,
                admins,
            },
        };

    } catch (error: any) {
        console.error("Erreur dans getAdminDashboardData:", error);
        if (error.message.includes('SERVICE_ACCOUNT_JSON')) {
            return {
                success: false,
                error: `La configuration du SDK Admin Firebase est incomplète. Assurez-vous que la variable d'environnement SERVICE_ACCOUNT_JSON est bien définie.`,
            };
        }
        return {
            success: false,
            error: error.message || 'Une erreur inconnue est survenue lors de la récupération des données.',
        };
    }
}
