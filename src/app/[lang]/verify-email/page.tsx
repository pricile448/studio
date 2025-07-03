import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { VerifyEmailClient } from '@/components/verify-email/verify-email-client';

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fr' }, { lang: 'de' }, { lang: 'es' }, { lang: 'pt' }];
}

export default async function VerifyEmailPage({ params }: { params: { lang: Locale }}) {
  const { lang } = params;
  const dict = await getDictionary(lang);
  return <VerifyEmailClient dict={dict} lang={lang} />;
}
