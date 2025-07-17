import { type Locale, type Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { CardsClient } from '@/components/cards/cards-client';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ lang: Locale }>;
}

export default async function CardsPage({ params }: Props) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  return <CardsClient dict={dict} lang={lang} />;
}
