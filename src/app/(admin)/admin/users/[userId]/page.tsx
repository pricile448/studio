import { UserDetailLoader } from '@/components/admin/user-detail-loader';

export default function AdminUserDetailPage({ params }: { params: { userId: string } }) {
    return <UserDetailLoader userId={params.userId} />;
}
