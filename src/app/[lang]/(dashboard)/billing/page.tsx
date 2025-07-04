
import { type Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { BillingClient } from '@/components/billing/billing-client';
import { getBillingConfigFlow } from '@/ai/flows/get-billing-config-flow';
import type { BillingConfig } from '@/lib/firebase/firestore';

export const dynamic = 'force-dynamic';

export default async function BillingPage({ params }: { params: { lang: Locale } }) {
  const { lang } = params;
  const dict = await getDictionary(lang);
  // Fetch config securely via the Genkit flow
  const billingConfig = await getBillingConfigFlow();
  
  return <BillingClient dict={dict} config={billingConfig as BillingConfig | null} />;
}
