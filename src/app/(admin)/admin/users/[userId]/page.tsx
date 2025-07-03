import { UserDetailLoader } from '@/components/admin/user-detail-loader';

export default async function AdminUserDetailPage({ params }: { params: { userId: string } }) {
    const { userId } = params;
    return <UserDetailLoader userId={userId} />;
}
