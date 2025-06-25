import { use } from 'react';
import type { Locale, Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { DashboardLayoutClient } from './layout-client';

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = use(params);
  const dict = use(getDictionary(lang));
  return (
    <DashboardLayoutClient dict={dict} lang={lang}>
      {children}
    </DashboardLayoutClient>
  );
}
