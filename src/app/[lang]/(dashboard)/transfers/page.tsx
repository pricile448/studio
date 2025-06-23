
import { type Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { TransfersClient } from '@/components/transfers/transfers-client';

const mockAccounts = [
  { id: '1', name: 'checking', balance: 4850.75 },
  { id: '2', name: 'savings', balance: 15340.21 },
];

const mockRecentTransfers = [
    { id: 'rt1', date: '2024-07-25', description: 'John Doe', amount: -250.00 },
    { id: 'rt2', date: '2024-07-22', description: 'Utility Bill', amount: -75.50 },
    { id: 'rt3', date: '2024-07-20', description: 'Jane Smith', amount: -500.00 },
];

const mockBeneficiaries = [
    { id: 'b1', name: 'John Doe', iban: 'FR7630004000041234567890185' },
    { id: 'b2', name: 'Jane Smith (Landlord)', iban: 'DE89370400440532013000' },
    { id: 'b3', name: 'Utility Company', iban: 'GB29NWBK60161331926819' },
];

export default async function TransfersPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);
  
  return <TransfersClient 
    dict={dict.transfers} 
    accountsDict={dict.accounts}
    accounts={mockAccounts} 
    recentTransfers={mockRecentTransfers} 
    beneficiaries={mockBeneficiaries}
    lang={lang} 
  />;
}
