
import { type Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { CardsClient } from '@/components/cards/cards-client';

export default async function CardsPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);
  
  return <CardsClient dict={dict.cards} />;
}
