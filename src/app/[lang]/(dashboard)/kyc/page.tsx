
import { type Locale, type Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { KycClient } from '@/components/kyc/kyc-client';

type Props = {
  params: Promise<{ lang: Locale }>;
}

export default async function KycPage({ params }: Props) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <KycClient dict={dict} lang={lang} />;
}
