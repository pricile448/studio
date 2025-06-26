
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
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
    { href: '/support', icon: HelpCircle, labelKey: 'help' },
    { href: '/more', icon: FileText, labelKey: 'documents' },
] as const

const NavMenu = ({ items, lang, dict, pathname }: { items: Readonly<Array<{href: string, icon: React.ElementType, labelKey: string}>>, lang: Locale, dict: Dictionary['sidebar'], pathname: string }) => {
    const { isMobile, setOpenMobile } = useSidebar();
    return (
        <SidebarMenu>
            {items.map((item) => {
                const Icon = item.icon;
                const fullPath = `/${lang}${item.href}`;
                // More robust active check for dashboard
                const isActive = item.href === '/dashboard' ? pathname === fullPath : pathname.startsWith(fullPath);
                const label = dict[item.labelKey as keyof typeof dict] as string;

                return (
                    <SidebarMenuItem key={item.href + item.labelKey}>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={label}
                        >
                            <Link href={fullPath} onClick={() => { if(isMobile) setOpenMobile(false)}}>
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

  return (
    <div className="flex h-full flex-col">
      <SidebarGroup>
        <SidebarGroupLabel>{sidebarGroupsDict.account}</SidebarGroupLabel>
        <NavMenu items={accountNavItems} lang={lang} dict={sidebarDict} pathname={pathname} />
      </SidebarGroup>
      <div className="mt-auto">
        <SidebarGroup>
          <SidebarGroupLabel>{sidebarGroupsDict.settingsAndMore}</SidebarGroupLabel>
          <NavMenu items={otherNavItems} lang={lang} dict={sidebarDict} pathname={pathname} />
        </SidebarGroup>
      </div>
    </div>
  );
}
