
import { use } from 'react';
import { type Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { BillingClient } from '@/components/billing/billing-client';

export const dynamic = 'force-dynamic';

export default function BillingPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = use(params);
  const dict = use(getDictionary(lang));
  
  return <BillingClient dict={dict} />;
}
