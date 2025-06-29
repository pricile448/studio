import { use } from 'react';
import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { ForgotPasswordClient } from '@/components/forgot-password/forgot-password-client';

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fr' }, { lang: 'de' }, { lang: 'es' }, { lang: 'pt' }];
}

export default function ForgotPasswordPage({ params }: { params: { lang: Locale }}) {
  const dict = use(getDictionary(params.lang));
  return <ForgotPasswordClient dict={dict} lang={params.lang} />;
}
