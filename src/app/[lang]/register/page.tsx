
import { use } from 'react';
import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { RegisterClient } from '@/components/register/register-client';

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fr' }, { lang: 'de' }, { lang: 'es' }, { lang: 'pt' }];
}

export default function RegisterPage({ params }: { params: { lang: Locale }}) {
  const { lang } = params;
  const dict = use(getDictionary(lang));
  return <RegisterClient dict={dict} lang={lang} />;
}
