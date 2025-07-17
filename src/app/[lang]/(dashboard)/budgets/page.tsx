import { type Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { BudgetsClient } from '@/components/budgets/budgets-client';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ lang: Locale }>;
}

export default async function BudgetsPage({ params }: Props) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <BudgetsClient 
    dict={dict} 
    lang={lang} 
  />;
}
