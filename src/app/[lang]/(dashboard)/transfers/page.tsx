import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { TransfersClient } from '@/components/transfers/transfers-client';

export const dynamic = 'force-dynamic';

export default async function TransfersPage({ params }: { params: { lang: Locale } }) {
  const { lang } = params;
  const dict = await getDictionary(lang);

  return <TransfersClient 
    dict={dict} 
    lang={lang} 
  />;
}
