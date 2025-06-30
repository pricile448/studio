import { UserDetailLoader } from '@/components/admin/user-detail-loader';
import { use } from 'react';

export default function AdminUserDetailPage({ params: paramsPromise }: { params: Promise<{ userId: string }> }) {
    const { userId } = use(paramsPromise);
    return <UserDetailLoader userId={userId} />;
}
