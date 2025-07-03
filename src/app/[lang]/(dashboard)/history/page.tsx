import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { HistoryClient } from '@/components/history/history-client';

export const dynamic = 'force-dynamic';

export default async function HistoryPage({ params }: { params: { lang: Locale }}) {
  const { lang } = params;
  const dict = await getDictionary(lang);
  
  return <HistoryClient dict={dict.history} lang={lang} />;
}
