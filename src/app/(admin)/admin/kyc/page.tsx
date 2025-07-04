
import { KycAdminClient } from '@/components/admin/kyc-admin-client';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AdminKycPage() {
    return (
        <div className="h-full flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold font-headline shrink-0 mb-6">Vérifications d'Identité (KYC)</h1>
            <div className="flex-1 min-h-0">
                 <ScrollArea className="h-full">
                    <KycAdminClient />
                </ScrollArea>
            </div>
        </div>
    );
}
