
'use client';

import { useAuth } from '@/context/auth-context';
import { ChatClient } from '@/components/chat/chat-client';
import { Skeleton } from '@/components/ui/skeleton';
import type { Dictionary } from '@/lib/dictionaries';
import { Card } from '../ui/card';

export function ChatPageClient({ dict }: { dict: Dictionary }) {
    const { user, userProfile, loading } = useAuth();

    if (loading || !user || !userProfile) {
        return <Skeleton className="h-full w-full rounded-lg" />;
    }
    
    return (
      <Card className="h-full">
        <ChatClient dict={dict.chat} user={user} userProfile={userProfile} />
      </Card>
    )
}
