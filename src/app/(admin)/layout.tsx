
'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Loader2 } from 'lucide-react';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/context/auth-context';

function AdminLayoutClient({ children }: { children: ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!user) {
            router.replace('/fr/login');
            return;
        }

        const checkAdminStatus = async () => {
            const adminRef = doc(db, 'admins', user.uid);
            const adminSnap = await getDoc(adminRef);

            if (adminSnap.exists()) {
                setIsAdmin(true);
            } else {
                console.warn("Accès non autorisé à la section admin.");
                router.replace('/fr/dashboard'); // Redirige les non-admins
            }
            setIsCheckingAdmin(false);
        };

        checkAdminStatus();

    }, [user, authLoading, router]);

    if (authLoading || isCheckingAdmin) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isAdmin) {
        return <>{children}</>;
    }

    // Affiche un état de chargement pendant la redirection pour éviter un flash de contenu
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
}


export default function AdminLayout({ children }: { children: React.ReactNode }) {
    // Note: L'interface admin n'utilisera pas l'internationalisation et sera en français.
    // Le AuthProvider est nécessaire ici pour que le contexte soit disponible.
    return (
        <html lang="fr" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </head>
            <body className={cn("font-body antialiased", process.env.NODE_ENV === 'development' ? 'debug-screens' : undefined)}>
                <AuthProvider>
                    <AdminLayoutClient>
                        {children}
                    </AdminLayoutClient>
                    <Toaster />
                </AuthProvider>
            </body>
        </html>
    );
}
