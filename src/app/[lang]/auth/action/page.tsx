import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { AuthActionClient } from '@/components/auth/action-client';

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fr' }, { lang: 'de' }, { lang: 'es' }, { lang: 'pt' }];
}

export default async function AuthActionPage({ params }: { params: { lang: Locale }}) {
  const dict = await getDictionary(params.lang);
  return <AuthActionClient dict={dict} lang={params.lang} />;
}
