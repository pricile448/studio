'use client';

import { type Locale, type Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { useAuth } from '@/context/auth-context';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePathname } from 'next/navigation';


export default function DashboardPage() {
  const pathname = usePathname();
  const lang = pathname.split('/')[1] as Locale;
  const { userProfile, loading } = useAuth();
  const [dict, setDict] = useState<Dictionary | null>(null);

  useEffect(() => {
    getDictionary(lang).then(setDict);
  }, [lang]);

  if (loading || !userProfile || !dict) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-8 w-1/3" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24 sm:col-span-2" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  // The 3 default accounts are always displayed, funded later by an admin
  const accounts = [
    { id: '1', name: 'checking', balance: 0, currency: 'EUR' },
    { id: '2', name: 'savings', balance: 0, currency: 'EUR' },
    { id: '3', name: 'credit', balance: 0, currency: 'EUR' },
  ];
  const transactions = [];
  const totalBalance = 0;

  return (
    <DashboardClient
      dict={dict.dashboard}
      accountsDict={dict.accounts}
      accounts={accounts}
      transactions={transactions}
      totalBalance={totalBalance}
    />
  );
}
