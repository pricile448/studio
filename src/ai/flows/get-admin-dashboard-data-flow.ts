
'use server';
/**
 * @fileOverview A flow to securely retrieve all necessary data for the admin dashboard.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { collection, query, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { getFirebaseServices } from '@/lib/firebase/config';
import type { UserProfile } from '@/lib/firebase/firestore';
import { getAdmins } from '@/lib/firebase/firestore';

const { db } = getFirebaseServices('admin');

// Serialized schemas for flow output
const ActivityItemSchema = z.object({
    id: z.string(),
    type: z.enum(['user', 'kyc']),
    timestamp: z.string(), // Pass date as ISO string
    data: z.any(),
});

const AdminDashboardDataSchema = z.object({
    stats: z.object({
        totalUsers: z.number(),
        pendingKyc: z.number(),
        approvedKyc: z.number(),
        rejectedKyc: z.number(),
    }),
    recentActivity: z.array(ActivityItemSchema),
    admins: z.array(z.any()),
});

export type AdminDashboardDataOutput = z.infer<typeof AdminDashboardDataSchema>;

export async function getAdminDashboardData(): Promise<AdminDashboardDataOutput> {
    return getAdminDashboardDataFlow();
}

const getAdminDashboardDataFlow = ai.defineFlow(
  {
    name: 'getAdminDashboardDataFlow',
    inputSchema: z.void(),
    outputSchema: AdminDashboardDataSchema,
  },
  async () => {
    try {
      // --- Fetch Stats ---
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const totalUsers = usersSnapshot.size;

      const kycCollection = collection(db, "kycSubmissions");
      const kycSnapshot = await getDocs(kycCollection);
      
      let pendingKyc = 0;
      let approvedKyc = 0;
      let rejectedKyc = 0;
      
      kycSnapshot.forEach(doc => {
          const status = doc.data().status;
          if (status === 'pending') pendingKyc++;
          else if (status === 'approved') approvedKyc++;
          else if (status === 'rejected') rejectedKyc++;
      });

      // --- Fetch Recent Activities ---
      const usersQuery = query(usersCollection, orderBy("createdAt", "desc"), limit(3));
      const recentUsersSnapshot = await getDocs(usersQuery);
      const recentUsers = recentUsersSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          type: 'user' as const, 
          id: doc.id,
          // Convert timestamp to string for serialization
          timestamp: (data.createdAt as Timestamp).toDate().toISOString(), 
          data: data 
        };
      });

      const kycQuery = query(kycCollection, orderBy("submittedAt", "desc"), limit(3));
      const recentKycSnapshot = await getDocs(kycQuery);
      const recentKyc = recentKycSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          type: 'kyc' as const, 
          id: doc.id,
          // Convert timestamp to string for serialization
          timestamp: (data.submittedAt as Timestamp).toDate().toISOString(),
          data: data 
        };
      });
      
      const combinedActivity = [...recentUsers, ...recentKyc]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5);

      // --- Fetch Admins ---
      const adminList = await getAdmins(db);

      return {
          stats: { totalUsers, pendingKyc, approvedKyc, rejectedKyc },
          recentActivity: combinedActivity,
          admins: adminList,
      };

    } catch (error: any) {
        console.error("Error fetching admin dashboard data in flow:", error);
        throw new Error("Failed to fetch admin dashboard data: " + error.message);
    }
  }
);
