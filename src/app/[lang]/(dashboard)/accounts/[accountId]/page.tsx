
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useParams } from 'next/navigation';
import type { Locale, Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { DollarSign, PiggyBank, CreditCard, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const accountIcons: { [key: string]: React.ElementType } = {
  checking: DollarSign,
  savings: PiggyBank,
  credit: CreditCard,
};

export default function AccountDetailsPage() {
  const pathname = usePathname();
  const params = useParams();
  const lang = params.lang as Locale;
  const accountId = params.accountId as string;
  
  const { userProfile, loading } = useAuth();
  const [dict, setDict] = useState<Dictionary | null>(null);

  useEffect(() => {
    if (lang) {
      getDictionary(lang).then(setDict);
    }
  }, [lang]);

  if (loading || !userProfile || !dict) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-8 w-48" />
            </div>
            <Separator />
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
        </div>
    );
  }

  const accounts = userProfile.accounts || [];
  const allTransactions = userProfile.transactions || [];

  const account = accounts.find(a => a.id === accountId);
  const transactions = allTransactions
    .filter(t => t.accountId === accountId)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  if (!account) {
    return <div>Account not found</div>;
  }
  
  const accountsDict = dict.accounts;
  
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
                  <TableCell>{format(tx.date, 'yyyy-MM-dd')}</TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell className={`text-right font-medium ${tx.amount > 0 ? 'text-accent' : ''}`}>
                    {formatCurrency(tx.amount)}
                  </TableCell>
                </TableRow>
              ))}
               {transactions.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                        {dict.history.noTransactions}
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
