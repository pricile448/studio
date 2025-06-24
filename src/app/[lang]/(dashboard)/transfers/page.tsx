
import { type Locale, type Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { TransfersClient } from '@/components/transfers/transfers-client';

export default async function TransfersPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);
  
  // A verified account starts empty until funded by an admin.
  const mockAccounts = [];
  const mockRecentTransfers = [];
  const mockBeneficiaries = [];

  return <TransfersClient 
    dict={dict} 
    accountsDict={dict.accounts}
    accounts={mockAccounts} 
    recentTransfers={mockRecentTransfers} 
    beneficiaries={mockBeneficiaries}
    lang={lang} 
  />;
}
