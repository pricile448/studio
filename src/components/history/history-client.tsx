
'use client';

import { useState } from 'react';
import type { Dictionary, Locale } from '@/lib/dictionaries';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Filter } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';

type HistoryClientProps = {
  dict: Dictionary['history'];
  transactions: { id: string; date: string; description: string; category: string; amount: number; status: string }[];
  lang: Locale;
};

export function HistoryClient({ dict, transactions, lang }: HistoryClientProps) {
  const { userProfile, loading } = useAuth();
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2024, 6, 1),
    to: addDays(new Date(2024, 6, 1), 30),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(amount);
  };

  if (loading || !userProfile) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-48" />
        </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">{dict.title}</h1>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <CardTitle className="font-headline flex-1">{dict.filters}</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className="w-full sm:w-[260px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>{dict.dateRange}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

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

