
import { use } from 'react';
import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { AccountsClient } from '@/components/accounts/accounts-client';

export const dynamic = 'force-dynamic';

export default function AccountsPage({ params }: { params: { lang: Locale }}) {
  const dict = use(getDictionary(params.lang));
  
  return <AccountsClient dict={dict} lang={params.lang} />;
}
