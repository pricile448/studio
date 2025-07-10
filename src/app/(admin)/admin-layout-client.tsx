
'use client';

import { useEffect, useState, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/admin-auth-context';
import { Loader2, LayoutDashboard, Users, ShieldCheck, LogOut, MessageSquare, ArrowRightLeft } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const adminNavItems = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { href: '/admin/users', icon: Users, label: 'Utilisateurs' },
    { href: '/admin/kyc', icon: ShieldCheck, label: 'Vérifications KYC' },
    { href: '/admin/messaging', icon: MessageSquare, label: 'Messagerie' },
    { href: '/admin/transfers', icon: ArrowRightLeft, label: 'Virements' },
];

export function AdminLayoutClient({ children }: { children: ReactNode }) {
    const { user, userProfile, loading, logout, isAdmin } = useAdminAuth();
    const router = useRouter();
    const pathname = usePathname();
    
    useEffect(() => {
        if (loading) {
            return;
        }

        if (!user || !isAdmin) {
             if (pathname !== '/admin/login') {
                router.replace('/admin/login');
            }
            return;
        }

        if (user && isAdmin && pathname === '/admin/login') {
            router.replace('/admin/dashboard');
        }

    }, [user, isAdmin, loading, router, pathname]);

    const handleLogout = async () => {
        // Redirect first to prevent race conditions with the auth state listener
        router.push('/admin/login');
        await logout();
    };

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }
    
    if (!user || !isAdmin) {
         return (
             <div className="flex h-screen w-full items-center justify-center bg-background">
                <p>Redirection...</p>
            </div>
        );
    }
    
    const displayName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : (user?.email || 'Admin');
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
                                    isActive={pathname.startsWith(item.href)}
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
                <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-card/50 px-4 md:px-6">
                    <SidebarTrigger className="md:hidden" />
                    <div className="flex-1" />
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
                <main className="flex-1 p-4 md:p-6 bg-muted/40">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    );
}
