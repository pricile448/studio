import { type Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { BudgetsClient } from '@/components/budgets/budgets-client';

export const dynamic = 'force-dynamic';

export default async function BudgetsPage({ params }: { params: { lang: Locale } }) {
  const { lang } = params;
  const dict = await getDictionary(lang);

  return <BudgetsClient 
    dict={dict} 
    lang={lang} 
  />;
}
