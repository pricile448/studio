
import { use } from 'react';
import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { HistoryClient } from '@/components/history/history-client';

export const dynamic = 'force-dynamic';

export default function HistoryPage({ params }: { params: Promise<{ lang: Locale }>}) {
  const { lang } = use(params);
  const dict = use(getDictionary(lang));
  
  return <HistoryClient dict={dict.history} lang={lang} />;
}
