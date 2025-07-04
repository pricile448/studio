
import { BillingAdminClient } from '@/components/admin/billing-admin-client';

export default function AdminBillingPage() {
    return (
        <div className="h-full flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold font-headline shrink-0 mb-6">Gestion de la Facturation</h1>
            <div className="flex-1 min-h-0 overflow-y-auto">
                <BillingAdminClient />
            </div>
        </div>
    );
}
