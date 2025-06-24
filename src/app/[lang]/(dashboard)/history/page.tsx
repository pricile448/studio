
'use client';

import { type Locale, type Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { HistoryClient } from '@/components/history/history-client';
import { useAuth } from '@/context/auth-context';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function HistoryPage({ params: { lang } }: { params: { lang: Locale } }) {
  const { userProfile, loading } = useAuth();
  const [dict, setDict] = useState<Dictionary | null>(null);

  useEffect(() => {
    getDictionary(lang).then(setDict);
  }, [lang]);

  if (loading || !userProfile || !dict) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-48" />
        </div>
    );
  }

  // A verified account starts empty until funded by an admin.
  const transactions = [];
  
  return <HistoryClient dict={dict.history} transactions={transactions} lang={lang} />;
}
