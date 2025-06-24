
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import type { Locale, Dictionary } from '@/lib/dictionaries';
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

export function DashboardLayoutClient({
  children,
  dict,
  lang,
}: {
  children: React.ReactNode;
  dict: Dictionary;
  lang: Locale;
}) {
  const { user, userProfile, loading, logout, isLoggingOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || isLoggingOut) return;

    if (!user) {
      router.push(`/${lang}/login`);
    } else if (!user.emailVerified) {
      router.push(`/${lang}/verify-email`);
    }
  }, [user, loading, router, lang, isLoggingOut]);

  if (loading || !user || !user.emailVerified || !userProfile) {
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

  const displayName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : (user.displayName || 'User');
  const initials = userProfile ? `${userProfile.firstName?.charAt(0) ?? ''}${userProfile.lastName?.charAt(0) ?? ''}`.toUpperCase() : user.email?.charAt(0).toUpperCase() || '';
  const notificationsDict = dict.dashboard.notifications;

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
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Bell className="h-5 w-5" />
                        <span className="sr-only">Notifications</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>{notificationsDict.title}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">{notificationsDict.welcomeTitle}</p>
                        <p className="text-xs text-muted-foreground">{notificationsDict.welcomeDescription}</p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">{notificationsDict.verificationTitle}</p>
                        <p className="text-xs text-muted-foreground">{notificationsDict.verificationDescription}</p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="justify-center text-sm text-muted-foreground" asChild>
                       <Link href="#">{notificationsDict.viewAll}</Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photoURL || ""} alt={displayName} data-ai-hint="user avatar" />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{displayName}</p>
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
