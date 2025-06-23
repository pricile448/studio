
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
]

export default async function TransfersPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);
  
  return <TransfersClient dict={dict.transfers} accounts={mockAccounts} recentTransfers={mockRecentTransfers} lang={lang} />;
}
