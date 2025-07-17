import { UserDetailClient } from '@/components/admin/user-detail-client';

type Props = {
  params: Promise<{ userId: string }>;
};

export default async function AdminUserDetailPage({ params }: Props) {
  const { userId } = await params;
  return <UserDetailClient userId={userId} />;
}
