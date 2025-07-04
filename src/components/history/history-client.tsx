
'use client';

import { useState } from 'react';
import type { Dictionary, Locale } from '@/lib/dictionaries';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { Input } from '@/components/ui/input';

type HistoryClientProps = {
  dict: Dictionary['history'];
  lang: Locale;
};

export function HistoryClient({ dict, lang }: HistoryClientProps) {
  const { userProfile, loading } = useAuth();
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2024, 6, 1),
    to: addDays(new Date(2024, 6, 1), 30),
  });

  if (loading || !userProfile) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-64" />
        </div>
    );
  }

  const transactions = (userProfile.transactions || []).map(tx => ({
    ...tx,
    date: format(new Date(tx.date), 'yyyy-MM-dd'),
  }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">{dict.title}</h1>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <CardTitle className="font-headline flex-1">{dict.filters}</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                  type="text"
                  placeholder="YYYY-MM-DD"
                  aria-label="Date de début"
                  value={date?.from ? format(date.from, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                      const fromDate = e.target.value ? new Date(e.target.value.replace(/-/g, '/')) : undefined;
                      setDate(current => ({ ...current, from: fromDate }));
                  }}
                  className="w-full sm:w-auto"
              />
              <Input
                  type="text"
                  placeholder="YYYY-MM-DD"
                  aria-label="Date de fin"
                  value={date?.to ? format(date.to, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                      const toDate = e.target.value ? new Date(e.target.value.replace(/-/g, '/')) : undefined;
                      setDate(current => ({ ...current, to: toDate }));
                  }}
                  className="w-full sm:w-auto"
              />

              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={dict.transactionType} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{dict.all}</SelectItem>
                  <SelectItem value="income">{dict.income}</SelectItem>
                  <SelectItem value="expense">{dict.expense}</SelectItem>
                </SelectContent>
              </Select>
              
              <Button className="w-full sm:w-auto"><Filter className="mr-2"/>{dict.applyFilters}</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            {/* Desktop table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{dict.table.date}</TableHead>
                    <TableHead>{dict.table.description}</TableHead>
                    <TableHead>{dict.table.category}</TableHead>
                    <TableHead>{dict.table.status}</TableHead>
                    <TableHead className="text-right">{dict.table.amount}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length > 0 ? transactions.map((tx) => (
                    <TableRow key={tx.id}>
                       <TableCell>{tx.date}</TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell>{tx.category}</TableCell>
                       <TableCell>
                         <Badge variant={tx.status === 'Completed' ? 'default' : 'secondary'} className={tx.status === 'Completed' ? 'bg-green-500/20 text-green-700 border-green-500/30 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' : ''}>
                          {dict.table.statuses[tx.status.toLowerCase() as keyof typeof dict.table.statuses]}
                         </Badge>
                       </TableCell>
                      <TableCell className={`text-right font-medium ${tx.amount > 0 ? 'text-accent' : ''}`}>
                        {formatCurrency(tx.amount)}
                      </TableCell>
                    </TableRow>
                  )) : (
                     <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                            {dict.noTransactions}
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Mobile list */}
            <div className="md:hidden">
              <div className="space-y-4">
                {transactions.length > 0 ? transactions.map((tx, index) => (
                  <div key={tx.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-sm text-muted-foreground">{tx.date} - {tx.category}</p>
                      </div>
                      <div className="text-right">
                         <p className={`font-semibold ${tx.amount > 0 ? 'text-accent' : ''}`}>
                          {formatCurrency(tx.amount)}
                        </p>
                        <Badge variant={tx.status === 'Completed' ? 'default' : 'secondary'} className={`mt-1 ${tx.status === 'Completed' ? 'bg-green-500/20 text-green-700 border-green-500/30 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' : ''}`}>
                             {dict.table.statuses[tx.status.toLowerCase() as keyof typeof dict.table.statuses]}
                        </Badge>
                      </div>
                    </div>
                    {index < transactions.length - 1 && <Separator className="my-4" />}
                  </div>
                )) : (
                     <div className="text-center text-muted-foreground py-12">
                        <p>{dict.noTransactions}</p>
                    </div>
                )}
              </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
