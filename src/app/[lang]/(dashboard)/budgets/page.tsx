
import { type Locale, type Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { BudgetsClient } from '@/components/budgets/budgets-client';

export default async function BudgetsPage({ params }: { params: { lang: Locale } }) {
  const dict = await getDictionary(params.lang);
  
  return <BudgetsClient dict={dict} lang={params.lang} />;
}
