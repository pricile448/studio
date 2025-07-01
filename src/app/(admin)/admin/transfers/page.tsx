import { TransfersAdminClient } from '@/components/admin/transfers-admin-client';

export default function AdminTransfersPage() {
    return (
        <div className="h-full flex flex-col">
            <h1 className="text-3xl font-bold font-headline shrink-0 mb-6">Gestion des Virements</h1>
            <div className="flex-1 min-h-0 overflow-y-auto">
                <TransfersAdminClient />
            </div>
        </div>
    );
}
