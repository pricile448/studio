import { MessagingAdminClient } from '@/components/admin/messaging-admin-client';

export default function AdminMessagingPage() {
    return (
        <div className="space-y-6 h-full flex flex-col">
            <h1 className="text-3xl font-bold font-headline">Messagerie</h1>
            <div className="flex-1">
                <MessagingAdminClient />
            </div>
        </div>
    );
}
