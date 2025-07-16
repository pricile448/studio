import { UserDetailClient } from '@/components/admin/user-detail-client';
import { getUserFromFirestore } from '@/lib/firebase/firestore';
import { getAdminDb } from '@/lib/firebase/admin';
import { notFound } from 'next/navigation';

export default async function AdminUserDetailPage({ params }: { params: { userId: string } }) {
    const { userId } = params;
    
    // Fetch data on the server
    const adminDb = getAdminDb();
    const userProfile = await getUserFromFirestore(userId, adminDb);

    if (!userProfile) {
        notFound();
    }
    
    // Pass the fetched data to the client component
    return <UserDetailClient initialUserProfile={userProfile} />;
}
