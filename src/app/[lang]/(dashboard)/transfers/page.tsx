
'use client';

import type { Locale, Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { TransfersClient } from '@/components/transfers/transfers-client';
import { useAuth } from '@/context/auth-context';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function TransfersPage() {
  const pathname = usePathname();
  const lang = pathname.split('/')[1] as Locale;
  const { userProfile, loading } = useAuth();
  const [dict, setDict] = useState<Dictionary | null>(null);

  useEffect(() => {
    getDictionary(lang).then(setDict);
  }, [lang]);

  if (loading || !userProfile || !dict) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-44" />
        </div>
        <Separator />
        <div className="grid gap-8 lg:grid-cols-3">
            <Skeleton className="lg:col-span-2 h-96" />
            <Skeleton className="lg:col-span-1 h-80" />
        </div>
      </div>
    )
  }
  
  const accounts = userProfile.accounts || [];
  const beneficiaries = userProfile.beneficiaries || [];
  const recentTransfers = (userProfile.transactions || [])
    .slice(0, 5)
    .map(tx => ({
        ...tx,
        date: format(tx.date.toDate(), 'PPP', { locale: lang === 'fr' ? require('date-fns/locale/fr') : require('date-fns/locale/en-US')})
    }));

  return <TransfersClient 
    dict={dict} 
    accountsDict={dict.accounts}
    accounts={accounts} 
    recentTransfers={recentTransfers} 
    beneficiaries={beneficiaries}
    lang={lang} 
  />;
}
