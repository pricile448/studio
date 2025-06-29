import { MessagingAdminClient } from '@/components/admin/messaging-admin-client';

export default function AdminMessagingPage() {
    return (
        <div className="h-full flex flex-col gap-6">
            <h1 className="text-3xl font-bold font-headline shrink-0">Messagerie</h1>
            <div className="flex-1 min-h-0">
                <MessagingAdminClient />
            </div>
        </div>
    );
}
