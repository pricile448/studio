
import { use } from 'react';
import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { AccountDetailsClient } from '@/components/accounts/account-details-client';

export const dynamic = 'force-dynamic';

export default function AccountDetailsPage({ params }: { params: Promise<{ lang: Locale, accountId: string }> }) {
  const { lang, accountId } = use(params);
  const dict = use(getDictionary(lang));
  
  return <AccountDetailsClient dict={dict} lang={lang} accountId={accountId} />;
}
