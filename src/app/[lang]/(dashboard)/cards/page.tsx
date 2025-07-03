import { type Locale, type Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { CardsClient } from '@/components/cards/cards-client';

export const dynamic = 'force-dynamic';

export default async function CardsPage({ params }: { params: { lang: Locale } }) {
  const { lang } = params;
  const dict = await getDictionary(lang);
  
  return <CardsClient dict={dict} lang={lang} />;
}
