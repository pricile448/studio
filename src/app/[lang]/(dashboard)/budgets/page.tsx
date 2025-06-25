
import { use } from 'react';
import { type Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { BudgetsClient } from '@/components/budgets/budgets-client';

export const dynamic = 'force-dynamic';

export default function BudgetsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = use(params);
  const dict = use(getDictionary(lang));

  return <BudgetsClient 
    dict={dict} 
    lang={lang} 
  />;
}
