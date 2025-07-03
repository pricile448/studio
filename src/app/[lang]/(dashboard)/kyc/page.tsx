import { type Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { KycClient } from '@/components/kyc/kyc-client';

export default async function KycPage({ params }: { params: { lang: Locale } }) {
  const { lang } = params;
  const dict = await getDictionary(lang);

  return <KycClient dict={dict.kyc} lang={lang} />;
}
