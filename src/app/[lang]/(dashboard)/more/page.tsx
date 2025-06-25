
import { type Locale, type Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { MoreClient } from '@/components/more/more-client';

export const dynamic = 'force-dynamic';

export default async function DocumentsPage({ params }: { params: { lang: Locale } }) {
  const dict = await getDictionary(params.lang);
  
  return <MoreClient dict={dict} lang={params.lang} />;
}
