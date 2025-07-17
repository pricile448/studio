
import type { Locale, Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { DashboardLayoutClient } from './layout-client';
import { Providers } from '@/app/providers';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return (
    <Providers>
      <DashboardLayoutClient dict={dict} lang={lang}>
          {children}
      </DashboardLayoutClient>
    </Providers>
  );
}
