import { type Locale, type Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { MoreClient } from '@/components/more/more-client';

export const dynamic = 'force-dynamic';

export default async function DocumentsPage({ params }: { params: { lang: Locale } }) {
  const { lang } = params;
  const dict = await getDictionary(lang);
  
  return <MoreClient dict={dict} lang={lang} />;
}
