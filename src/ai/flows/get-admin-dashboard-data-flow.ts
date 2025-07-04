
'use server';
/**
 * @fileOverview A flow to securely retrieve all necessary data for the admin dashboard.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/admin';
import type { UserProfile } from '@/lib/firebase/firestore';
import type { Timestamp } from 'firebase-admin/firestore';

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
      const usersCollection = adminDb.collection("users");
      const usersSnapshot = await usersCollection.get();
      const totalUsers = usersSnapshot.size;

      const kycCollection = adminDb.collection("kycSubmissions");
      const kycSnapshot = await kycCollection.get();
      
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
      const usersQuery = usersCollection.orderBy("createdAt", "desc").limit(3);
      const recentUsersSnapshot = await usersQuery.get();
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

      const kycQuery = kycCollection.orderBy("submittedAt", "desc").limit(3);
      const recentKycSnapshot = await kycQuery.get();
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
      const adminsSnap = await adminDb.collection('admins').get();
      const adminIds = adminsSnap.docs.map(doc => doc.id);
      const adminProfilesPromises = adminIds.map(id => usersCollection.doc(id).get());
      const adminProfileDocs = await Promise.all(adminProfilesPromises);
      const adminList = adminProfileDocs
        .filter(doc => doc.exists)
        .map(doc => doc.data() as UserProfile);


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
