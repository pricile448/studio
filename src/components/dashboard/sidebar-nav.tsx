
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
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
  MoreHorizontal,
} from 'lucide-react';
import type { Dictionary, Locale } from '@/lib/dictionaries';
import { cn } from '@/lib/utils';

interface SidebarNavProps {
  lang: Locale;
  dict: Dictionary['sidebar'];
}

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  { href: '/accounts', icon: Wallet, labelKey: 'accounts' },
  { href: '/iban', icon: Landmark, labelKey: 'iban' },
  { href: '/transfers', icon: ArrowRightLeft, labelKey: 'transfers' },
  { href: '/cards', icon: CreditCard, labelKey: 'cards' },
  { href: '/history', icon: History, labelKey: 'history' },
  { href: '/budgets', icon: PieChart, labelKey: 'budgets' },
  { href: '/settings', icon: Settings, labelKey: 'settings' },
  { href: '/more', icon: MoreHorizontal, labelKey: 'more' },
] as const;


export function SidebarNav({ lang, dict }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const Icon = item.icon;
        const fullPath = `/${lang}${item.href}`;
        const isActive = pathname === fullPath;
        const label = dict[item.labelKey as keyof typeof dict] as string;

        return (
          <SidebarMenuItem key={item.href}>
            <Link href={fullPath} passHref legacyBehavior>
              <SidebarMenuButton
                isActive={isActive}
                className={cn(isActive && 'bg-primary/10 text-primary hover:text-primary')}
                tooltip={label}
              >
                <Icon />
                <span>{label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
