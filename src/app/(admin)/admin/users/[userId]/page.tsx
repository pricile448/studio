'use client';

import { getUserFromFirestore, type UserProfile } from '@/lib/firebase/firestore';
import { UserDetailClient } from '@/components/admin/user-detail-client';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminUserDetailPage({ params }: { params: { userId: string } }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            setError(null);
            try {
                const userProfile = await getUserFromFirestore(params.userId);
                if (!userProfile) {
                    setError('User not found');
                } else {
                    setUser(userProfile);
                }
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Failed to fetch user data.');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [params.userId]);

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !user) {
        // `notFound` will trigger the display of the nearest not-found.js file.
        notFound();
    }
    
    return (
        <UserDetailClient userProfile={user} />
    );
}
