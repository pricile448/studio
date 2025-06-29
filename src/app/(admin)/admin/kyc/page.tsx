import { KycAdminClient } from '@/components/admin/kyc-admin-client';

export default function AdminKycPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">Vérifications d'Identité (KYC)</h1>
            <KycAdminClient />
        </div>
    );
}
