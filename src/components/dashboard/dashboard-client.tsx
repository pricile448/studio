
'use client';

import * as React from 'react';
import type { Dictionary, Locale } from '@/lib/dictionaries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CreditCard, DollarSign, PiggyBank, ArrowRightLeft, UserPlus, History, Settings, Leaf, HeartPulse, Scale, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { VerificationBanner } from './verification-banner';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '../ui/skeleton';
import { format } from 'date-fns';

type DashboardClientProps = {
  dict: Dictionary['dashboard'];
  accountsDict: Dictionary['accounts'];
  lang: Locale;
};

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

export function DashboardClient({ dict, accountsDict, lang }: DashboardClientProps) {
  const { userProfile, loading } = useAuth();

  if (loading || !userProfile) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-8 w-1/3" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24 sm:col-span-2" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  const accounts = userProfile.accounts || [];
  const transactions = (userProfile.transactions || []).map(tx => ({
    ...tx,
    date: format(new Date(tx.date), 'yyyy-MM-dd'),
  }));
  const totalBalance = accounts.reduce((acc, account) => acc + account.balance, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const getAccountName = (name: string) => {
    const key = name as keyof typeof accountsDict;
    return accountsDict[key] || name;
  }

  const quickActions = [
    { href: `/${lang}/transfers`, label: dict.quickActions.makeTransfer, icon: ArrowRightLeft },
    { href: `/${lang}/transfers`, label: dict.quickActions.addBeneficiary, icon: UserPlus },
    { href: `/${lang}/history`, label: dict.quickActions.viewHistory, icon: History },
    { href: `/${lang}/settings`, label: dict.quickActions.settings, icon: Settings },
  ];

  const displayName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : '';
  
  const chartData = React.useMemo(() => {
    const expenseTransactions = transactions.filter(tx => tx.amount < 0);
    const expensesByCategory: {[key: string]: number} = expenseTransactions.reduce((acc, tx) => {
      const category = tx.category || 'Other';
      acc[category] = (acc[category] || 0) + Math.abs(tx.amount);
      return acc;
    }, {} as {[key: string]: number});

    return Object.entries(expensesByCategory).map(([category, expenses]) => ({
      category,
      expenses,
    }));
  }, [transactions]);
  
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <VerificationBanner dict={dict.verificationBanner} lang={lang} />
      <h1 className="text-3xl font-bold font-headline">{dict.greeting}, {displayName}!</h1>
      
      {/* Account Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
         <Card className="sm:col-span-2 bg-gradient-to-r from-primary to-primary-gradient-end text-primary-foreground">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{dict.totalBalance}</CardTitle>
                <Scale className="h-4 w-4 text-primary-foreground/80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
              </CardContent>
        </Card>
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

      {/* Quick Actions Card */}
       <Card>
        <CardHeader>
          <CardTitle className="font-headline">{dict.quickActions.title}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button key={index} variant="outline" className="h-20 flex-col gap-2" asChild>
                <Link href={action.href}>
                  <Icon className="h-6 w-6 text-primary" />
                  <span className="text-center">{action.label}</span>
                </Link>
              </Button>
            );
          })}
        </CardContent>
      </Card>
      
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">{dict.recentTransactions}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{dict.transaction.description}</TableHead>
                    <TableHead className="hidden sm:table-cell">{dict.transaction.category}</TableHead>
                    <TableHead className="hidden lg:table-cell">{dict.transaction.date}</TableHead>
                    <TableHead className="text-right">{dict.transaction.amount}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div className="font-medium">{tx.description}</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{tx.category}</TableCell>
                      <TableCell className="hidden lg:table-cell">{tx.date}</TableCell>
                      <TableCell className={`text-right ${tx.amount > 0 ? 'text-accent' : ''}`}>
                        {formatCurrency(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Mobile list */}
            <div className="md:hidden px-6 pb-6">
              <div className="space-y-4">
                {recentTransactions.map((tx, index) => (
                  <div key={tx.id}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-sm text-muted-foreground">{tx.category}</p>
                      </div>
                      <p className={`font-semibold ${tx.amount > 0 ? 'text-accent' : ''}`}>
                        {formatCurrency(tx.amount)}
                      </p>
                    </div>
                    {index < transactions.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">{dict.expenseChart}</CardTitle>
          </CardHeader>
           <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <BarChart accessibilityLayer data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="category" tickLine={false} tickMargin={10} axisLine={false} tick={false} />
                  <YAxis hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-center text-muted-foreground">
                <p>{dict.noExpenseData}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-6">
          <Card className="bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-blue-950/40 dark:via-background dark:to-purple-950/40 w-full overflow-hidden">
            <CardContent className="p-6 relative">
                <div className="absolute inset-0 opacity-20">
                    <Star className="h-6 w-6 fill-current absolute top-8 right-1/4 md:top-6 md:right-1/3 text-yellow-400" />
                    <Star className="h-4 w-4 fill-current absolute top-16 right-[30%] md:top-12 md:right-[35%] text-cyan-400" />
                    <Star className="h-5 w-5 fill-current absolute top-6 right-[35%] md:top-20 md:right-[40%] text-pink-500" />
                </div>
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 z-10 relative">
                    <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-2xl md:text-3xl font-bold font-headline text-primary">{dict.youthOffer.title}</h3>
                        <p className="text-lg font-medium text-foreground">{dict.youthOffer.subtitle}</p>
                        <p className="text-muted-foreground">{dict.youthOffer.line1}</p>
                        <p className="text-sm text-muted-foreground">{dict.youthOffer.line2}</p>
                    </div>
                    
                    <div className="relative flex-shrink-0 text-center mt-6 md:mt-0 w-[190px] h-[160px]">
                        <div className="bg-primary text-primary-foreground rounded-2xl shadow-lg w-full h-[100px] flex flex-col justify-center items-center pt-2 absolute top-0">
                            <p className="text-4xl font-bold leading-none">{dict.youthOffer.offer_year}</p>
                            <p className="text-sm tracking-wide">{dict.youthOffer.offer_subscription}</p>
                        </div>
                        
                        <div className="absolute left-1/2 -translate-x-1/2 top-[75px] bg-red-500 text-white font-bold py-1.5 px-6 rounded-md shadow-md text-lg z-10">
                            {dict.youthOffer.offer_free}
                        </div>
                        
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-[15px] bg-cyan-400 text-white font-semibold py-1.5 px-5 rounded-full shadow-md text-sm z-20">
                            {dict.youthOffer.offer_commitment}
                        </div>
                    </div>
                </div>
            </CardContent>
          </Card>
       </div>
    </div>
  );
}

    