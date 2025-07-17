
import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { RegisterClient } from '@/components/register/register-client';

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fr' }, { lang: 'de' }, { lang: 'es' }, { lang: 'pt' }];
}

type Props = {
  params: Promise<{ lang: Locale }>;
}

export default async function RegisterPage({ params }: Props) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return <RegisterClient dict={dict} lang={lang} />;
}
