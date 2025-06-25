
'use client';

import type { Locale, Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { HistoryClient } from '@/components/history/history-client';
import { useAuth } from '@/context/auth-context';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function HistoryPage() {
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
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-64" />
        </div>
    );
  }
  
  const transactions = (userProfile.transactions || []).map(tx => ({
    ...tx,
    date: tx.date.toLocaleDateString(lang),
  }));
  
  return <HistoryClient dict={dict.history} transactions={transactions} lang={lang} />;
}
