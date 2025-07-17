
import { type Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { BillingClient } from '@/components/billing/billing-client';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ lang: Locale }>;
}

export default async function BillingPage({ params }: Props) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  return <BillingClient dict={dict} />;
}
