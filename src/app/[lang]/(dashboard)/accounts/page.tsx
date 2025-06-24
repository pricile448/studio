
'use client';

import { useState, useEffect } from 'react';
import type { Locale, Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, PiggyBank, CreditCard, ArrowLeftRight, Activity, Scale } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

const mockAccountsData = [
  { id: '1', name: 'checking', balance: 4850.75, currency: 'EUR' },
  { id: '2', name: 'savings', balance: 15340.21, currency: 'EUR' },
  { id: '3', name: 'credit', balance: -789.43, currency: 'EUR' },
];

function InternalTransfer({ accounts, dict, lang }: { accounts: typeof mockAccountsData, dict: Dictionary['accounts'], lang: Locale }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict.internalTransferTitle}</CardTitle>
        <CardDescription>{dict.internalTransferDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
         <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from">{dict.fromAccount}</Label>
              <Select disabled={accounts.length === 0}>
                <SelectTrigger id="from">
                  <SelectValue placeholder={dict.fromAccount} />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {dict[account.name as keyof typeof dict]} - {formatCurrency(account.balance)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="to">{dict.toAccount}</Label>
              <Select disabled={accounts.length === 0}>
                <SelectTrigger id="to">
                  <SelectValue placeholder={dict.toAccount} />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                       {dict[account.name as keyof typeof dict]} - {formatCurrency(account.balance)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">{dict.transferAmount}</Label>
            <Input id="amount" type="number" placeholder="0.00" disabled={accounts.length === 0} />
          </div>
      </CardContent>
      <CardFooter>
        <Button disabled={accounts.length === 0}>
          <ArrowLeftRight className="mr-2 h-4 w-4" />
          {dict.submitTransfer}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function AccountsPage() {
  const pathname = usePathname();
  const lang = pathname.split('/')[1] as Locale;
  const { userProfile, loading } = useAuth();
  const [dict, setDict] = useState<Dictionary | null>(null);

  useEffect(() => {
    getDictionary(lang).then(setDict);
  }, [lang]);

  if (loading || !userProfile || !dict) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <Separator />
        <Skeleton className="h-28" />
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-80" />
      </div>
    );
  }
  
  // A verified account starts empty until funded by an admin.
  const accounts = [];
  const ledger = [];
  const totalBalance = 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  const accountsDict = dict.accounts;

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

      <Card className="bg-primary text-primary-foreground">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium font-headline">{accountsDict.totalBalance}</CardTitle>
          <Scale className="h-5 w-5 text-primary-foreground/80" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatCurrency(totalBalance)}</div>
          <p className="text-xs text-primary-foreground/80">{accountsDict.totalBalanceDescription}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {accounts.map((account) => {
          const Icon = accountIcons[account.name] || DollarSign;
          return (
            <Card key={account.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium font-headline">{getAccountName(account.name)}</CardTitle>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">{formatCurrency(account.balance)}</div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/${lang}/accounts/${account.id}`}>
                    {accountsDict.details}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <InternalTransfer accounts={accounts} dict={accountsDict} lang={lang} />
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{accountsDict.accountingTitle}</CardTitle>
        </CardHeader>
        <CardContent>
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dict.history.table.date}</TableHead>
                <TableHead>{dict.history.table.description}</TableHead>
                <TableHead className="text-right">{dict.accounts.creditLedger}</TableHead>
                <TableHead className="text-right">{dict.accounts.debitLedger}</TableHead>
                <TableHead className="text-right">{dict.accounts.balanceLedger}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledger.length > 0 ? ledger.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell className="text-right text-green-600">{entry.credit > 0 ? formatCurrency(entry.credit) : '-'}</TableCell>
                  <TableCell className="text-right text-red-600">{entry.debit > 0 ? formatCurrency(entry.debit) : '-'}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(entry.balance)}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
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
