import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { AccountsClient } from '@/components/accounts/accounts-client';

export const dynamic = 'force-dynamic';

export default async function AccountsPage({ params }: { params: { lang: Locale } }) {
  const { lang } = params;
  const dict = await getDictionary(lang);
  
  return <AccountsClient dict={dict} lang={lang} />;
}
