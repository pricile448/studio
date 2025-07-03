import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { AccountDetailsClient } from '@/components/accounts/account-details-client';

export const dynamic = 'force-dynamic';

export default async function AccountDetailsPage({ params }: { params: { lang: Locale, accountId: string } }) {
  const { lang, accountId } = params;
  const dict = await getDictionary(lang);
  
  return <AccountDetailsClient dict={dict} lang={lang} accountId={accountId} />;
}
