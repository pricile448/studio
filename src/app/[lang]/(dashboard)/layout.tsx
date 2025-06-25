
import type { Locale, Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { DashboardLayoutClient } from './layout-client';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const dict = await getDictionary(params.lang);
  return (
    <DashboardLayoutClient dict={dict} lang={params.lang}>
      {children}
    </DashboardLayoutClient>
  );
}
