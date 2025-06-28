
import { use } from 'react';
import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { AdvisorClient } from '@/components/advisor/advisor-client';

export const dynamic = 'force-dynamic';

export default function AdvisorPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = use(params);
  const dict = use(getDictionary(lang));
  
  return <AdvisorClient dict={dict} lang={lang} />;
}
