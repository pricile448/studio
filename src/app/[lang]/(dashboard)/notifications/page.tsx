
import { type Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { NotificationsClient } from '@/components/notifications/notifications-client';

export default async function NotificationsPage({ params }: { params: { lang: Locale } }) {
  const dict = await getDictionary(params.lang);
  
  return <NotificationsClient dict={dict} />;
}
