
import { getDictionary, type Locale } from '@/lib/dictionaries';
import { HistoryClient } from '@/components/history/history-client';

const mockTransactions = [
  { id: 't1', date: '2024-07-28', description: 'Netflix Subscription', category: 'Entertainment', amount: -15.99, status: 'Completed' },
  { id: 't2', date: '2024-07-27', description: 'Grocery Store', category: 'Food', amount: -124.32, status: 'Completed' },
  { id: 't3', date: '2024-07-26', description: 'Salary Deposit', category: 'Income', amount: 2500.00, status: 'Completed' },
  { id: 't4', date: '2024-07-25', description: 'Gas Station', category: 'Transport', amount: -55.60, status: 'Completed' },
  { id: 't5', date: '2024-07-24', description: 'Restaurant Dinner', category: 'Food', amount: -85.50, status: 'Completed' },
  { id: 't6', date: '2024-07-22', description: 'Online Purchase', category: 'Shopping', amount: -75.00, status: 'Pending' },
  { id: 't7', date: '2024-07-20', description: 'ATM Withdrawal', category: 'Cash', amount: -100.00, status: 'Completed' },
];

export default async function HistoryPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);
  
  return <HistoryClient dict={dict.history} transactions={mockTransactions} lang={lang} />;
}
