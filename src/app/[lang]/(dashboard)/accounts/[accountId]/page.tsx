
import { use } from 'react';
import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { AccountDetailsClient } from '@/components/accounts/account-details-client';

export const dynamic = 'force-dynamic';

export default function AccountDetailsPage({ params }: { params: { lang: Locale, accountId: string }}) {
  const dict = use(getDictionary(params.lang));
  
  return <AccountDetailsClient dict={dict} lang={params.lang} accountId={params.accountId} />;
}
