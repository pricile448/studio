import { type Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { BillingClient } from '@/components/billing/billing-client';

export const dynamic = 'force-dynamic';

export default async function BillingPage({ params }: { params: { lang: Locale } }) {
  const { lang } = params;
  const dict = await getDictionary(lang);
  
  return <BillingClient dict={dict} />;
}
