
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import type { Locale, Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Bell, LogOut } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [dict, setDict] = useState<Dictionary | null>(null);

  useEffect(() => {
    getDictionary(lang).then(setDict);
  }, [lang]);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push(`/${lang}/login`);
    } else if (!user.emailVerified) {
      router.push(`/${lang}/verify-email`);
    }
  }, [user, loading, router, lang]);

  if (loading || !user || !user.emailVerified || !dict) {
    return (
        <div className="flex h-screen w-full bg-background">
            <div className="hidden md:block">
                 <Skeleton className="h-full w-[16rem] bg-muted" />
            </div>
            <div className="flex-1 flex flex-col">
                <Skeleton className="h-14 lg:h-[60px] border-b" />
                <div className="flex-1 p-4 lg:p-6">
                    <Skeleton className="h-full w-full" />
                </div>
                 <Skeleton className="h-14 border-t" />
            </div>
        </div>
    );
  }

  return (
    <SidebarProvider key={lang}>
      <Sidebar>
        <SidebarHeader className="bg-sidebar">
          <div className="flex items-center gap-2">
            <Logo text={dict.logo} />
            <h1 className="text-lg font-headline font-semibold group-data-[collapsible=icon]:hidden">
              {dict.logo}
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav lang={lang} dict={dict} />
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => logout()} size="lg" tooltip={dict.sidebar.userMenu.logout}>
                        <LogOut />
                        <span>{dict.sidebar.userMenu.logout}</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card/50 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
          <SidebarTrigger className="md:hidden" />
          <div className="w-full flex-1">
            {/* Future search bar could go here */}
          </div>
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" asChild>
                <Link href="#">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Notifications</span>
                </Link>
             </Button>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photoURL || "https://placehold.co/100x100.png"} alt={user.displayName || 'User'} data-ai-hint="user avatar" />
                            <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href={`/${lang}/settings`}>
                           {dict.sidebar.userMenu.profile}
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/${lang}/settings`}>
                            {dict.sidebar.userMenu.settings}
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
        <footer className="border-t bg-card/50">
            <div className="container mx-auto flex items-center justify-center p-4">
              <p className="text-sm text-muted-foreground">
                {dict.homePage.footer.copyright}
              </p>
            </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
