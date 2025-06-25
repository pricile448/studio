
import { use } from 'react';
import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { TransfersClient } from '@/components/transfers/transfers-client';

export const dynamic = 'force-dynamic';

export default function TransfersPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = use(params);
  const dict = use(getDictionary(lang));

  return <TransfersClient 
    dict={dict} 
    lang={lang} 
  />;
}
