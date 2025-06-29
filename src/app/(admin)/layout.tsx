
'use client';

import { useEffect, useState, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Loader2, LayoutDashboard, Users, ShieldCheck, LogOut } from 'lucide-react';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/context/auth-context';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const adminNavItems = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { href: '#', icon: Users, label: 'Utilisateurs' },
    { href: '#', icon: ShieldCheck, label: 'Vérifications KYC' },
];

function AdminLayoutClient({ children }: { children: ReactNode }) {
    const { user, userProfile, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

    useEffect(() => {
        if (authLoading) return;

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
                router.replace('/fr/dashboard');
            }
            setIsCheckingAdmin(false);
        };

        checkAdminStatus();

    }, [user, authLoading, router]);

    const handleLogout = async () => {
        await logout();
        router.push('/fr/login');
    };

    if (authLoading || isCheckingAdmin || !userProfile) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAdmin) {
        return (
             <div className="flex h-screen w-full items-center justify-center bg-background">
                <p>Redirection...</p>
            </div>
        );
    }
    
    const displayName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : (user?.displayName || 'Admin');
    const initials = userProfile ? `${userProfile.firstName?.charAt(0) ?? ''}${userProfile.lastName?.charAt(0) ?? ''}`.toUpperCase() : 'A';


    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <div className="flex items-center gap-2">
                         <Logo text="AmCbunq" />
                         <h1 className="text-lg font-headline font-semibold group-data-[collapsible=icon]:hidden">
                            Admin
                         </h1>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                         {adminNavItems.map((item) => (
                             <SidebarMenuItem key={item.label}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname === item.href}
                                    tooltip={item.label}
                                >
                                    <Link href={item.href}>
                                        <item.icon />
                                        <span>{item.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                         ))}
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                     <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={handleLogout} tooltip="Déconnexion">
                                <LogOut />
                                <span>Déconnexion</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <div className="flex-1 flex flex-col">
                <header className="flex h-14 items-center justify-end gap-4 border-b bg-card/50 px-6">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.photoURL || ""} alt={displayName} data-ai-hint="admin avatar" />
                                    <AvatarFallback>{initials}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{displayName}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                Déconnexion
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>
                <main className="flex-1 p-6 bg-muted/40">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
