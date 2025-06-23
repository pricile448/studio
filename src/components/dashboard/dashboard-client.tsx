
'use client';

import type { Dictionary } from '@/lib/dictionaries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AiAssistant } from './ai-assistant';
import type { FinancialInsightsInput } from '@/ai/flows/financial-insights';
import { CreditCard, DollarSign, PiggyBank } from 'lucide-react';

type DashboardClientProps = {
  dict: Dictionary['dashboard'];
  accounts: { id: string; name: string; balance: number; currency: string }[];
  transactions: { id: string; date: string; description: string; category: string; amount: number; currency: string }[];
  aiFinancialData: FinancialInsightsInput;
};

const chartData = [
  { category: 'Food', expenses: 450 },
  { category: 'Transport', expenses: 200 },
  { category: 'Shopping', expenses: 300 },
  { category: 'Entertainment', expenses: 150 },
  { category: 'Housing', expenses: 1500 },
  { category: 'Other', expenses: 100 },
];

const chartConfig = {
  expenses: {
    label: 'Expenses',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const accountIcons: { [key: string]: React.ElementType } = {
  checking: DollarSign,
  savings: PiggyBank,
  credit: CreditCard,
};

export function DashboardClient({ dict, accounts, transactions, aiFinancialData }: DashboardClientProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getAccountName = (name: string) => {
    switch (name) {
      case 'checking': return dict.checkingAccount;
      case 'savings': return dict.savingsAccount;
      case 'credit': return dict.creditCard;
      default: return name;
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">{dict.title}</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => {
          const Icon = accountIcons[account.name] || DollarSign;
          return (
            <Card key={account.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{getAccountName(account.name)}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(account.balance)}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">{dict.recentTransactions}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{dict.transaction.description}</TableHead>
                  <TableHead className="hidden sm:table-cell">{dict.transaction.category}</TableHead>
                  <TableHead className="hidden md:table-cell">{dict.transaction.date}</TableHead>
                  <TableHead className="text-right">{dict.transaction.amount}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <div className="font-medium">{tx.description}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{tx.category}</TableCell>
                    <TableCell className="hidden md:table-cell">{tx.date}</TableCell>
                    <TableCell className={`text-right ${tx.amount > 0 ? 'text-accent' : ''}`}>
                      {formatCurrency(tx.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">{dict.expenseChart}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="category" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <AiAssistant dict={dict.aiAssistant} financialData={aiFinancialData} />
    </div>
  );
}
