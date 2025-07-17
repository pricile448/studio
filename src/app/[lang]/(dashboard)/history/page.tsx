import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { HistoryClient } from '@/components/history/history-client';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ lang: Locale }>;
}

export default async function HistoryPage({ params }: Props) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  return <HistoryClient dict={dict.history} lang={lang} />;
}
