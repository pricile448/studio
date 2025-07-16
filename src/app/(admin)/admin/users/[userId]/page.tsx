import { UserDetailClient } from '@/components/admin/user-detail-client';

export default async function AdminUserDetailPage({
  params,
}: {
  params: { userId: string };
}) {
  return <UserDetailClient userId={params.userId} />;
}
