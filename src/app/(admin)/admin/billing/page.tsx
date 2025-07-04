
import { BillingAdminClient } from '@/components/admin/billing-admin-client';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AdminBillingPage() {
    return (
        <div className="h-full flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold font-headline shrink-0 mb-6">Gestion de la Facturation</h1>
            <div className="flex-1 min-h-0">
                 <ScrollArea className="h-full">
                    <BillingAdminClient />
                </ScrollArea>
            </div>
        </div>
    );
}
