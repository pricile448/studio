import { use } from 'react';
import { type Locale, type Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { MoreClient } from '@/components/more/more-client';

export const dynamic = 'force-dynamic';

export default function DocumentsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = use(params);
  const dict = use(getDictionary(lang));
  
  return <MoreClient dict={dict} lang={lang} />;
}
