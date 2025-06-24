
import { type Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { HistoryClient } from '@/components/history/history-client';

export default async function HistoryPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);
  
  // A verified account starts empty until funded by an admin.
  const transactions = [];
  
  return <HistoryClient dict={dict.history} transactions={transactions} lang={lang} />;
}
