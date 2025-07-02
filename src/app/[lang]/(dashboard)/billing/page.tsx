
import { use } from 'react';
import { type Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { BillingClient } from '@/components/billing/billing-client';

export const dynamic = 'force-dynamic';

export default function BillingPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = use(params);
  const dict = use(getDictionary(lang));
  
  const bankDetails = {
    holder: 'AmCbunq Services',
    iban: 'FR76 3000 6000 0112 3456 7890 189',
    bic: 'SOGEFRPPXXX',
  };

  return <BillingClient dict={dict} details={bankDetails} />;
}
