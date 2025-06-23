
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Wallet,
  Landmark,
  ArrowRightLeft,
  CreditCard,
  History,
  PieChart,
  Settings,
  HelpCircle,
  FileText,
} from 'lucide-react';
import type { Dictionary, Locale } from '@/lib/dictionaries';
import { cn } from '@/lib/utils';

interface SidebarNavProps {
  lang: Locale;
  dict: Dictionary;
}

const accountNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  { href: '/accounts', icon: Wallet, labelKey: 'accounts' },
  { href: '/iban', icon: Landmark, labelKey: 'iban' },
  { href: '/transfers', icon: ArrowRightLeft, labelKey: 'transfers' },
  { href: '/cards', icon: CreditCard, labelKey: 'cards' },
  { href: '/history', icon: History, labelKey: 'history' },
  { href: '/budgets', icon: PieChart, labelKey: 'budgets' },
] as const;

const otherNavItems = [
    { href: '/settings', icon: Settings, labelKey: 'settings' },
    { href: '/help', icon: HelpCircle, labelKey: 'help' },
    { href: '/more', icon: FileText, labelKey: 'documents' },
] as const

const NavList = ({ items, lang, dict, pathname }: { items: Readonly<Array<{href: string, icon: React.ElementType, labelKey: string}>>, lang: Locale, dict: Dictionary['sidebar'], pathname: string }) => {
    return (
        <SidebarMenu>
            {items.map((item) => {
                const Icon = item.icon;
                const fullPath = `/${lang}${item.href}`;
                const isActive = pathname.startsWith(fullPath) && (item.href !== '/dashboard' || pathname === `/${lang}/dashboard`);
                const label = dict[item.labelKey as keyof typeof dict] as string;

                return (
                    <SidebarMenuItem key={item.href + item.labelKey}>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            className={cn(isActive && 'bg-primary/10 text-primary hover:text-primary')}
                            tooltip={label}
                        >
                            <Link href={fullPath}>
                                <Icon />
                                <span>{label}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                );
            })}
        </SidebarMenu>
    );
};


export function SidebarNav({ lang, dict }: SidebarNavProps) {
  const pathname = usePathname();
  const sidebarDict = dict.sidebar;
  const sidebarGroupsDict = dict.sidebarGroups;

  // A more robust active check for the dashboard link
  const isDashboardActive = pathname === `/${lang}/dashboard`;
  const accountNavItemsWithActive = accountNavItems.map(item => ({
      ...item,
      isActive: item.href === '/dashboard' ? isDashboardActive : pathname.startsWith(`/${lang}${item.href}`),
  }))

  return (
    <div className="flex h-full flex-col">
      <SidebarGroup>
        <SidebarGroupLabel>{sidebarGroupsDict.account}</SidebarGroupLabel>
         <SidebarMenu>
            {accountNavItems.map((item) => {
                const Icon = item.icon;
                const fullPath = `/${lang}${item.href}`;
                const isActive = item.href === '/dashboard' ? pathname === fullPath : pathname.startsWith(fullPath);
                const label = sidebarDict[item.labelKey as keyof typeof sidebarDict] as string;

                return (
                    <SidebarMenuItem key={item.href + item.labelKey}>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            className={cn(isActive && 'bg-primary/10 text-primary hover:text-primary')}
                            tooltip={label}
                        >
                            <Link href={fullPath}>
                                <Icon />
                                <span>{label}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                );
            })}
        </SidebarMenu>
      </SidebarGroup>
      <div className="mt-auto">
        <SidebarGroup>
          <SidebarGroupLabel>{sidebarGroupsDict.settingsAndMore}</SidebarGroupLabel>
          <NavList items={otherNavItems} lang={lang} dict={sidebarDict} pathname={pathname} />
        </SidebarGroup>
      </div>
    </div>
  );
}
