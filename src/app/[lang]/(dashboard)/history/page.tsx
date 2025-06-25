
import { type Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { HistoryClient } from '@/components/history/history-client';

export default async function HistoryPage({ params }: { params: { lang: Locale } }) {
  const dict = await getDictionary(params.lang);
  
  // A verified account starts empty until funded by an admin.
  const transactions = [];
  
  return <HistoryClient dict={dict.history} transactions={transactions} lang={params.lang} />;
}
