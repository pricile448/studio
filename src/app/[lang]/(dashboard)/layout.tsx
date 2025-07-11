
import type { Locale, Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { DashboardLayoutClient } from './layout-client';
import { UserProfileProvider } from '@/context/user-profile-context';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const { lang } = params;
  const dict = await getDictionary(lang);
  return (
    <UserProfileProvider>
        <DashboardLayoutClient dict={dict} lang={lang}>
            {children}
        </DashboardLayoutClient>
    </UserProfileProvider>
  );
}
