import { use } from 'react';
import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { VerifyEmailClient } from '@/components/verify-email/verify-email-client';

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fr' }, { lang: 'de' }, { lang: 'es' }, { lang: 'pt' }];
}

export default function VerifyEmailPage({ params }: { params: { lang: Locale }}) {
  const dict = use(getDictionary(params.lang));
  return <VerifyEmailClient dict={dict} lang={params.lang} />;
}
