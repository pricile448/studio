
import { type Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { DollarSign, PiggyBank, CreditCard, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Mock data, in a real app this would come from an API
const mockAccounts = [
  { id: '1', name: 'checking', balance: 4850.75, currency: 'EUR', accountNumber: '**** **** **** 1234' },
  { id: '2', name: 'savings', balance: 15340.21, currency: 'EUR', accountNumber: '**** **** **** 5678' },
  { id: '3', name: 'credit', balance: -789.43, currency: 'EUR', accountNumber: '**** **** **** 9010' },
];

const mockTransactions = [
  { id: 't1', accountId: '1', date: '2024-07-27', description: 'Grocery Store', amount: -124.32 },
  { id: 't2', accountId: '1', date: '2024-07-26', description: 'Salary Deposit', amount: 2500.00 },
  { id: 't3', accountId: '2', date: '2024-07-25', description: 'Transfer to Savings', amount: 500.00 },
  { id: 't4', accountId: '1', date: '2024-07-25', description: 'Transfer to Savings', amount: -500.00 },
  { id: 't5', accountId: '3', date: '2024-07-24', description: 'Restaurant Dinner', amount: -85.50 },
];

const accountIcons: { [key: string]: React.ElementType } = {
  checking: DollarSign,
  savings: PiggyBank,
  credit: CreditCard,
};

export default async function AccountDetailsPage({ params }: { params: { lang: Locale, accountId: string } }) {
  const { lang, accountId } = params;
  const dict = await getDictionary(lang);
  const accountsDict = dict.accounts;

  const account = mockAccounts.find(a => a.id === accountId);
  const transactions = mockTransactions.filter(t => t.accountId === accountId);

  if (!account) {
    // In a real app, you'd probably redirect to a 404 page
    return <div>Account not found</div>;
  }
  
  const getAccountName = (name: string) => {
    const key = name as keyof typeof accountsDict;
    return accountsDict[key] || name;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  const Icon = accountIcons[account.name] || DollarSign;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
           <Link href={`/${lang}/accounts`}>
              <ArrowLeft />
           </Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline">{getAccountName(account.name)}</h1>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{dict.iban.accountDetails}</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4">
            <Icon className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{dict.accounts.title}</p>
              <p className="font-semibold">{getAccountName(account.name)}</p>
            </div>
          </div>
          <div className="text-right">
              <p className="text-sm text-muted-foreground">{accountsDict.totalBalance}</p>
              <p className="text-2xl font-bold">{formatCurrency(account.balance)}</p>
          </div>
           <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">{accountsDict.accountNumber}</p>
              <p className="font-mono tracking-widest">{account.accountNumber}</p>
           </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{dict.history.title}</CardTitle>
          <CardDescription>{accountsDict.accountDetailsDescription}</CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dict.history.table.date}</TableHead>
                <TableHead>{dict.history.table.description}</TableHead>
                <TableHead className="text-right">{dict.history.table.amount}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.date}</TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell className={`text-right font-medium ${tx.amount > 0 ? 'text-accent' : ''}`}>
                    {formatCurrency(tx.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
