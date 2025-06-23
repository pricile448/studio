
import { type Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, PiggyBank, CreditCard } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const mockAccounts = [
  { id: '1', name: 'checking', balance: 4850.75, currency: 'USD' },
  { id: '2', name: 'savings', balance: 15340.21, currency: 'USD' },
  { id: '3', name: 'credit', balance: -789.43, currency: 'USD' },
];

const accountIcons: { [key: string]: React.ElementType } = {
  checking: DollarSign,
  savings: PiggyBank,
  credit: CreditCard,
};

export default async function AccountsPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);
  const accountsDict = dict.accounts;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(lang, { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getAccountName = (name: string) => {
    const key = name as keyof typeof accountsDict;
    return accountsDict[key] || name;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold font-headline">{accountsDict.title}</h1>
      </div>
      <Separator />
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {mockAccounts.map((account) => {
          const Icon = accountIcons[account.name] || DollarSign;
          return (
            <Card key={account.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium font-headline">{getAccountName(account.name)}</CardTitle>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">{formatCurrency(account.balance)}</div>
                <Button variant="outline" className="w-full">
                  {accountsDict.details}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
