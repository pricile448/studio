
'use client';

import { useEffect, useState, useCallback } from 'react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Bell, LogOut, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useInactivityLogout } from '@/hooks/use-inactivity-logout';
import { useToast } from '@/hooks/use-toast';
import { ChatPageClient } from '@/components/chat/chat-page-client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { BalanceToggle } from '@/components/ui/balance-toggle';

export function DashboardLayoutClient({
  children,
  dict,
  lang,
}: {
  children: React.ReactNode;
  dict: Dictionary;
  lang: Locale;
}) {
  const { user, userProfile, loading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const notificationsDict = dict.dashboard.notifications;
  const mockNotifications = [
      {
          id: '1',
          title: notificationsDict.welcomeTitle,
          description: notificationsDict.welcomeDescription,
      },
      {
          id: '2',
          title: notificationsDict.verificationTitle,
          description: notificationsDict.verificationDescription,
      },
  ]

  const [selectedNotification, setSelectedNotification] = useState<(typeof mockNotifications)[0] | null>(null);

  const handleLogout = useCallback(async (isInactive = false) => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    if (isInactive) {
      toast({
          title: dict.login.inactivityLogoutTitle,
          description: dict.login.inactivityLogoutDescription,
      });
    }
    await logout();
    router.push(`/${lang}/login${isInactive ? '?reason=inactivity' : ''}`);
  }, [isLoggingOut, logout, router, lang, toast, dict]);

  // Read timeout from user profile, with a default of 15 minutes.
  const timeoutMinutes = userProfile?.inactivityTimeout ?? 15;
  const timeoutMs = timeoutMinutes * 60 * 1000;

  // The hook is now called unconditionally. The internal logic of the hook handles the `timeout > 0` case.
  useInactivityLogout(timeoutMs, () => handleLogout(true));


  useEffect(() => {
    if (loading || isLoggingOut) return;

    if (!user) {
      router.push(`/${lang}/login`);
    } else if (!user.emailVerified) {
      router.push(`/${lang}/verify-email`);
    }
  }, [user, loading, router, lang, isLoggingOut]);

  if (loading || !user || !user.emailVerified || !userProfile || !dict) {
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

  return (
    <SidebarProvider key={lang}>
      <Sidebar>
        <SidebarHeader>
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
            <div className="flex items-center gap-3 p-2">
                <div className="relative">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user.photoURL || ""} alt={displayName} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    {userProfile?.kycStatus === 'verified' && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-sidebar" />
                    )}
                </div>
                <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-semibold text-sidebar-foreground truncate">{displayName}</span>
                    {userProfile?.kycStatus === 'verified' ? (
                        <span className="text-xs font-bold text-green-400">{dict.sidebar.verified}</span>
                    ) : (
                        <span className="text-xs text-sidebar-foreground/70 truncate">{dict.sidebar.unverified}</span>
                    )}
                </div>
            </div>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => handleLogout(false)} tooltip={dict.sidebar.userMenu.logout}>
                        <LogOut />
                        <span>{dict.sidebar.userMenu.logout}</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card/50 px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="w-full flex-1">
            {/* Future search bar could go here */}
          </div>
          <div className="flex items-center gap-2">
               <BalanceToggle dict={dict.sidebar} />
               <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full max-w-md p-0 flex flex-col">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle>{dict.chat.headerTitle}</SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 min-h-0">
                    <ChatPageClient dict={dict} />
                  </div>
                </SheetContent>
              </Sheet>
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
                     {mockNotifications.map((notification) => (
                        <DropdownMenuItem key={notification.id} onSelect={() => setSelectedNotification(notification)} className="flex-col items-start cursor-pointer">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-xs text-muted-foreground truncate w-full">{notification.description}</p>
                        </DropdownMenuItem>
                      ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="justify-center text-sm text-muted-foreground" asChild>
                       <Link href={`/${lang}/notifications`}>{notificationsDict.viewAll}</Link>
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
        <main className="overflow-y-auto bg-background p-4 lg:p-6">
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
       <AlertDialog open={!!selectedNotification} onOpenChange={(open) => { if (!open) setSelectedNotification(null) }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{selectedNotification?.title}</AlertDialogTitle>
              <AlertDialogDescription className="text-base text-foreground text-left">
                {selectedNotification?.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setSelectedNotification(null)}>
                {dict.cards.closeButton}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </SidebarProvider>
  );
}
