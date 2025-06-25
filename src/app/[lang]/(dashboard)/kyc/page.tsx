import { use } from 'react';
import { type Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { KycClient } from '@/components/kyc/kyc-client';

export default function KycPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = use(params);
  const dict = use(getDictionary(lang));

  return <KycClient dict={dict.kyc} lang={lang} />;
}
