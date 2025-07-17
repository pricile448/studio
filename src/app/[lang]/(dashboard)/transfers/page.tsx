import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { TransfersClient } from '@/components/transfers/transfers-client';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ lang: Locale }>;
}

export default async function TransfersPage({ params }: Props) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <TransfersClient 
    dict={dict} 
    lang={lang} 
  />;
}
