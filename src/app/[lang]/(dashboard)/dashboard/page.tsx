import { type Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { DashboardClient } from '@/components/dashboard/dashboard-client';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ params }: { params: { lang: Locale }}) {
  const { lang } = params;
  const dict = await getDictionary(lang);

  return (
    <DashboardClient
      dict={dict.dashboard}
      accountsDict={dict.accounts}
      lang={lang}
    />
  );
}
