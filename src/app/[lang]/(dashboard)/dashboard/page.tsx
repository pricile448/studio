'use client';

import { type Locale, type Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { useAuth } from '@/context/auth-context';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePathname } from 'next/navigation';


const mockAccountsData = [
  { id: '1', name: 'checking', balance: 4850.75, currency: 'EUR' },
  { id: '2', name: 'savings', balance: 15340.21, currency: 'EUR' },
  { id: '3', name: 'credit', balance: -789.43, currency: 'EUR' },
];

const mockTransactionsData = [
  { id: 't1', date: '2024-07-28', description: 'Netflix Subscription', category: 'Entertainment', amount: -15.99, currency: 'EUR' },
  { id: 't2', date: '2024-07-27', description: 'Grocery Store', category: 'Food', amount: -124.32, currency: 'EUR' },
  { id: 't3', date: '2024-07-26', description: 'Salary Deposit', category: 'Income', amount: 2500.00, currency: 'EUR' },
  { id: 't4', date: '2024-07-25', description: 'Gas Station', category: 'Transport', amount: -55.60, currency: 'EUR' },
  { id: 't5', date: '2024-07-24', description: 'Restaurant Dinner', category: 'Food', amount: -85.50, currency: 'EUR' },
];

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

  const isVerified = userProfile.kycStatus === 'verified';
  
  const accounts = isVerified ? mockAccountsData : [];
  const transactions = isVerified ? mockTransactionsData : [];
  const totalBalance = isVerified ? accounts.reduce((acc, account) => acc + account.balance, 0) : 0;

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
