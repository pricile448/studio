
'use server';
/**
 * @fileOverview A flow to securely retrieve all necessary data for the admin dashboard.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/admin';
import type { UserProfile } from '@/lib/firebase/firestore';
import { Timestamp } from 'firebase-admin/firestore';

// Serializes a Firestore document data object by converting Timestamps to ISO strings.
// This is necessary to pass data from Server Components/Actions to Client Components.
function serializeTimestamps(data: any): any {
    if (!data || typeof data !== 'object') {
        return data;
    }

    if (data instanceof Timestamp) {
        return data.toDate().toISOString();
    }

    if (Array.isArray(data)) {
        return data.map(item => serializeTimestamps(item));
    }
    
    const newObj: { [key: string]: any } = {};
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            newObj[key] = serializeTimestamps(data[key]);
        }
    }

    return newObj;
}


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

// New schema for the result object
const AdminDashboardDataResultSchema = z.object({
    success: z.boolean(),
    data: AdminDashboardDataSchema.optional(),
    error: z.string().optional(),
});
export type AdminDashboardDataResult = z.infer<typeof AdminDashboardDataResultSchema>;


export async function getAdminDashboardData(): Promise<AdminDashboardDataResult> {
    return getAdminDashboardDataFlow();
}

const getAdminDashboardDataFlow = ai.defineFlow(
  {
    name: 'getAdminDashboardDataFlow',
    inputSchema: z.void(),
    outputSchema: AdminDashboardDataResultSchema,
  },
  async () => {
    if (!adminDb) {
        return {
            success: false,
            error: "Firebase Admin SDK n'est pas initialisé. Veuillez configurer SERVICE_ACCOUNT_JSON dans votre fichier .env pour le développement local. Voir DEPLOYMENT.md pour les instructions.",
        };
    }

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
          data: serializeTimestamps(data)
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
          data: serializeTimestamps(data)
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
        .map(doc => serializeTimestamps(doc.data()));


      const data = {
          stats: { totalUsers, pendingKyc, approvedKyc, rejectedKyc },
          recentActivity: combinedActivity,
          admins: adminList,
      };

      return { success: true, data };

    } catch (error: any) {
        console.error("Error fetching admin dashboard data in flow:", error);
        if (error.message.includes('Could not refresh access token')) {
             return { success: false, error: "Échec de l'authentification auprès de Firebase. Assurez-vous que vos identifiants de compte de service (SERVICE_ACCOUNT_JSON) sont corrects et valides." };
        }
        return { success: false, error: "Failed to fetch admin dashboard data: " + error.message };
    }
  }
);
