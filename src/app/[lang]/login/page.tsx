
import { use } from 'react';
import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { LoginClient } from '@/components/login/login-client';

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fr' }, { lang: 'de' }, { lang: 'es' }, { lang: 'pt' }];
}

export default function LoginPage({ params: paramsPromise }: { params: Promise<{ lang: Locale }>}) {
  const { lang } = use(paramsPromise);
  const dict = use(getDictionary(lang));
  return <LoginClient dict={dict} lang={lang} />;
}
