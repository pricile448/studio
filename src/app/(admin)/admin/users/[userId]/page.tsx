import { UserDetailClient } from '@/components/admin/user-detail-client';

type Props = {
  params: Promise<{ userId: string }>;
};

// Cette fonction est nécessaire pour le prérendu statique des routes dynamiques
export async function generateStaticParams() {
  // Comme nous ne pouvons pas connaître tous les IDs d'utilisateurs à l'avance,
  // nous définissons cette fonction vide pour indiquer à Next.js de ne pas essayer
  // de générer cette page statiquement
  return [];
}

export const dynamic = 'force-dynamic';

export default async function AdminUserDetailPage({ params }: Props) {
  const { userId } = await params;
  return <UserDetailClient userId={userId} />;
}
