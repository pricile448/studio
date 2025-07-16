import { UserDetailClient } from '@/components/admin/user-detail-client';

// Using a specific type for props as recommended to ensure type safety without global conflicts.
type Props = {
  params: {
    userId: string;
  };
};

export default function AdminUserDetailPage({ params }: Props) {
  // This page is now a simple wrapper. It passes the userId
  // to the client component, which will handle its own data fetching.
  return <UserDetailClient userId={params.userId} />;
}
