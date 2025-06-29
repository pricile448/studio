
import { getUserFromFirestore } from '@/lib/firebase/firestore';
import { UserDetailClient } from '@/components/admin/user-detail-client';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminUserDetailPage({ params }: { params: { userId: string } }) {
    const user = await getUserFromFirestore(params.userId);

    if (!user) {
        notFound();
    }

    return (
        <UserDetailClient userProfile={user} />
    );
}
