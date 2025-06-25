import { use } from 'react';
import { type Locale, type Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { CardsClient } from '@/components/cards/cards-client';

export const dynamic = 'force-dynamic';

export default function CardsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = use(params);
  const dict = use(getDictionary(lang));
  
  return <CardsClient dict={dict} lang={lang} />;
}
