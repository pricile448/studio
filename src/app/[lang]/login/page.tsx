import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { LoginClient } from '@/components/login/login-client';

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fr' }, { lang: 'de' }, { lang: 'es' }, { lang: 'pt' }];
}

export default async function LoginPage({ params }: { params: { lang: Locale }}) {
  const dict = await getDictionary(params.lang);
  return <LoginClient dict={dict} lang={params.lang} />;
}
