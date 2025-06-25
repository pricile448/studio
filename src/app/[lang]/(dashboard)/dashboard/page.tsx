
import { use } from 'react';
import { type Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { DashboardClient } from '@/components/dashboard/dashboard-client';

export const dynamic = 'force-dynamic';

export default function DashboardPage({ params }: { params: Promise<{ lang: Locale }>}) {
  const { lang } = use(params);
  const dict = use(getDictionary(lang));

  return (
    <DashboardClient
      dict={dict.dashboard}
      accountsDict={dict.accounts}
      lang={lang}
    />
  );
}
