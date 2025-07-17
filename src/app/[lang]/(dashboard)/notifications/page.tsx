import { type Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { NotificationsClient } from '@/components/notifications/notifications-client';

type Props = {
  params: Promise<{ lang: Locale }>;
}

export default async function NotificationsPage({ params }: Props) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  return <NotificationsClient dict={dict} />;
}
