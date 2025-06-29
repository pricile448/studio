import { UsersClient } from '@/components/admin/users-client';

export default function AdminUsersPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">Gestion des Utilisateurs</h1>
            <UsersClient />
        </div>
    );
}
