import { use } from 'react';
import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { RegisterClient } from '@/components/register/register-client';

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fr' }, { lang: 'de' }, { lang: 'es' }, { lang: 'pt' }];
}

export default function RegisterPage({ params }: { params: { lang: Locale }}) {
  const dict = use(getDictionary(params.lang));
  return <RegisterClient dict={dict} lang={params.lang} />;
}
