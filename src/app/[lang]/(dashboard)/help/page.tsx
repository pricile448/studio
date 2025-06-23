
import { type Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { AiAssistant } from '@/components/dashboard/ai-assistant';

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

export default async function HelpPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);

  return (
    <div className="space-y-6">
       <h1 className="text-3xl font-bold font-headline">{dict.help.title}</h1>
       <AiAssistant dict={dict.dashboard.aiAssistant} financialData={mockFinancialDataForAI} />
    </div>
  );
}
