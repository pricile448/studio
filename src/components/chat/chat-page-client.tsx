
'use client';

import { useAuth } from '@/context/auth-context';
import { ChatClient } from '@/components/chat/chat-client';
import { Skeleton } from '@/components/ui/skeleton';
import type { Dictionary } from '@/lib/dictionaries';

export function ChatPageClient({ dict }: { dict: Dictionary }) {
    const { user, userProfile, loading } = useAuth();

    if (loading || !user || !userProfile) {
        return <Skeleton className="h-full w-full rounded-lg" />;
    }
    
    return (
        <ChatClient dict={dict} user={user} userProfile={userProfile} />
    )
}
