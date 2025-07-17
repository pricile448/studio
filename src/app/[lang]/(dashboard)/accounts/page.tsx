import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { AccountsClient } from '@/components/accounts/accounts-client';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ lang: Locale }>;
}

export default async function AccountsPage({ params }: Props) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  return <AccountsClient dict={dict} lang={lang} />;
}
