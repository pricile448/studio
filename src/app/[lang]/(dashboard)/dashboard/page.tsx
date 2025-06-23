
import { type Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { DashboardClient } from '@/components/dashboard/dashboard-client';

const mockAccounts = [
  { id: '1', name: 'checking', balance: 4850.75, currency: 'USD' },
  { id: '2', name: 'savings', balance: 15340.21, currency: 'USD' },
  { id: '3', name: 'credit', balance: -789.43, currency: 'USD' },
];

const mockTransactions = [
  { id: 't1', date: '2024-07-28', description: 'Netflix Subscription', category: 'Entertainment', amount: -15.99, currency: 'USD' },
  { id: 't2', date: '2024-07-27', description: 'Grocery Store', category: 'Food', amount: -124.32, currency: 'USD' },
  { id: 't3', date: '2024-07-26', description: 'Salary Deposit', category: 'Income', amount: 2500.00, currency: 'USD' },
  { id: 't4', date: '2024-07-25', description: 'Gas Station', category: 'Transport', amount: -55.60, currency: 'USD' },
  { id: 't5', date: '2024-07-24', description: 'Restaurant Dinner', category: 'Food', amount: -85.50, currency: 'USD' },
];

const mockFinancialDataForAI = {
  transactionHistory: [
    { date: '2024-07-27', description: 'Groceries', amount: -124.32, category: 'Food' },
    { date: '2024-07-26', description: 'Salary', amount: 2500, category: 'Income' },
    { date: '2024-07-25', description: 'Gasoline', amount: -55.60, category: 'Transportation' },
    { date: '2024-07-24', description: 'Restaurant', amount: -85.50, category: 'Food' },
    { date: '2024-07-20', description: 'Movie tickets', amount: -30.00, category: 'Entertainment' },
    { date: '2024-07-15', description: 'Online shopping', amount: -200.00, category: 'Shopping' },
    { date: '2024-07-01', description: 'Rent', amount: -1500, category: 'Housing' },
  ],
  income: 5000,
  expenses: 3200,
};

export default async function DashboardPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);

  return (
    <DashboardClient
      dict={dict.dashboard}
      accounts={mockAccounts}
      transactions={mockTransactions}
      aiFinancialData={mockFinancialDataForAI}
    />
  );
}
