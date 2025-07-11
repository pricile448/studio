
import { MessagingAdminClient } from '@/components/admin/messaging-admin-client';

export default function AdminMessagingPage() {
    return (
        <div className="h-full flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold font-headline shrink-0 mb-6">Messagerie</h1>
            <div className="flex-1 min-h-0">
                <MessagingAdminClient />
            </div>
        </div>
    );
}
