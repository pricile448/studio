
'use client';

import { useState, useMemo } from 'react';
import type { Dictionary, Locale } from '@/lib/dictionaries';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DateRange } from 'react-day-picker';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { enUS, fr, de, es, pt } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/lib/firebase/firestore';

type HistoryClientProps = {
  dict: Dictionary['history'];
  lang: Locale;
};

const dateLocales: Record<Locale, typeof enUS> = {
    en: enUS,
    fr,
    de,
    es,
    pt
};

export function HistoryClient({ dict, lang }: HistoryClientProps) {
  const { userProfile, loading } = useAuth();
  
  const defaultDateRange = {
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  };

  const [date, setDate] = useState<DateRange | undefined>(defaultDateRange);
  const [transactionType, setTransactionType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const resetFilters = () => {
    setDate(defaultDateRange);
    setTransactionType('all');
    setSearchTerm('');
  }

  const filteredTransactions: Transaction[] = useMemo(() => {
    if (!userProfile?.transactions) return [];

    return userProfile.transactions.filter(tx => {
      const txDate = new Date(tx.date);

      // Date filter logic
      const from = date?.from;
      const to = date?.to;
      if (from && to) {
        if (txDate < from || txDate > to) return false;
      } else if (from) {
        if (txDate < from) return false;
      } else if (to) {
        if (txDate > to) return false;
      }
      
      // Type filter
      if (transactionType === 'income' && tx.amount <= 0) return false;
      if (transactionType === 'expense' && tx.amount >= 0) return false;

      // Search term filter on description
      if (searchTerm && !tx.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [userProfile?.transactions, date, transactionType, searchTerm]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  const formatDate = (date: Date) => {
      return format(date, 'P', { locale: dateLocales[lang] });
  }

  if (loading || !userProfile) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-64" />
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
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <Input
                  placeholder={dict.table.description}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-auto md:w-[200px]"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full sm:w-auto md:w-[260px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "LLL dd, y", { locale: dateLocales[lang] })} -{" "}
                            {format(date.to, "LLL dd, y", { locale: dateLocales[lang] })}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y", { locale: dateLocales[lang] })
                        )
                      ) : (
                        <span>{dict.dateRange}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                      locale={dateLocales[lang]}
                    />
                  </PopoverContent>
                </Popover>
                <Select value={transactionType} onValueChange={setTransactionType}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder={dict.transactionType} />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">{dict.all}</SelectItem>
                    <SelectItem value="income">{dict.income}</SelectItem>
                    <SelectItem value="expense">{dict.expense}</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="ghost" onClick={resetFilters} className="w-full sm:w-auto">
                    <X className="mr-2 h-4 w-4" />
                    {dict.resetFiltersButton}
                </Button>
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
                  {filteredTransactions.length > 0 ? filteredTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                       <TableCell>{formatDate(tx.date)}</TableCell>
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
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
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
                {filteredTransactions.length > 0 ? filteredTransactions.map((tx, index) => (
                  <div key={tx.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(tx.date)} - {tx.category}</p>
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
