import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { AccountDetailsClient } from '@/components/accounts/account-details-client';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ lang: Locale; accountId: string }>;
};

export default async function AccountDetailsPage({ params }: Props) {
  const { lang, accountId } = await params;
  const dict = await getDictionary(lang);

  return <AccountDetailsClient dict={dict} lang={lang} accountId={accountId} />;
}