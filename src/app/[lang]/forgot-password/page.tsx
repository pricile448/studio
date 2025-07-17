
import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { ForgotPasswordClient } from '@/components/forgot-password/forgot-password-client';

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fr' }, { lang: 'de' }, { lang: 'es' }, { lang: 'pt' }];
}

type Props = {
  params: Promise<{ lang: Locale }>;
}

export default async function ForgotPasswordPage({ params }: Props) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return <ForgotPasswordClient dict={dict} lang={lang} />;
}
