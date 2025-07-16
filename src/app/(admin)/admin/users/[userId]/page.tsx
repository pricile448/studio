import { UserDetailClient } from '@/components/admin/user-detail-client';
import { getUserFromFirestore } from '@/lib/firebase/firestore';
import { getAdminDb } from '@/lib/firebase/admin';
import { notFound } from 'next/navigation';

export default async function AdminUserDetailPage({ params }: { params: { userId: string } }) {
  const adminDb = getAdminDb();
  const userProfile = await getUserFromFirestore(params.userId, adminDb);

  if (!userProfile) {
    notFound();
  }

  // The key fix: serialize the props before passing to the client component
  // to remove non-plain objects like Date.
  return <UserDetailClient initialUserProfile={JSON.parse(JSON.stringify(userProfile))} />;
}
