import { type Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { BillingClient } from '@/components/billing/billing-client';
import { getBillingConfig, type BillingConfig } from '@/lib/firebase/firestore';

export const dynamic = 'force-dynamic';

export default async function BillingPage({ params }: { params: { lang: Locale } }) {
  const { lang } = params;
  const dict = await getDictionary(lang);
  const billingConfig = await getBillingConfig();
  
  return <BillingClient dict={dict} config={billingConfig} />;
}
