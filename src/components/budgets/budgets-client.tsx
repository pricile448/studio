
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Dictionary, Locale } from '@/lib/dictionaries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, ShoppingCart, Clapperboard, Car, Utensils } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const initialBudgets = [
  { id: '1', name: 'groceries', spent: 350.50, total: 500, icon: ShoppingCart },
  { id: '2', name: 'entertainment', spent: 120.00, total: 200, icon: Clapperboard },
  { id: '3', name: 'transport', spent: 180.75, total: 250, icon: Car },
];

const budgetSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  total: z.coerce.number().positive({ message: 'Amount must be a positive number.' }),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

export function BudgetsClient({ dict, lang }: { dict: Dictionary, lang: Locale }) {
  const budgetsDict = dict.budgets;
  const [budgets, setBudgets] = useState(initialBudgets);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { name: '', total: 0 },
  });

  const onSubmit = (data: BudgetFormValues) => {
    const newBudget = {
      id: `b${budgets.length + 1}`,
      name: data.name,
      spent: 0,
      total: data.total,
      icon: Utensils, // Default icon for new budgets
    };
    setBudgets(prev => [...prev, newBudget]);
    toast({
      title: budgetsDict.budgetCreated,
      description: budgetsDict.budgetCreatedDescription.replace('{name}', data.name),
    });
    form.reset();
    setIsDialogOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(lang, { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getBudgetName = (name: string) => {
    const key = name as keyof typeof budgetsDict;
    return budgetsDict[key] || name;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold font-headline">{budgetsDict.title}</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2" />
              {budgetsDict.createBudget}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>{budgetsDict.createBudgetTitle}</DialogTitle>
                  <DialogDescription>{budgetsDict.createBudgetDescription}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2 pb-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{budgetsDict.budgetNameLabel}</FormLabel>
                        <FormControl>
                          <Input placeholder={budgetsDict.budgetNamePlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="total"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{budgetsDict.budgetAmountLabel}</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="300.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">{dict.transfers.cancelButton}</Button>
                  </DialogClose>
                  <Button type="submit">{budgetsDict.saveBudgetButton}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <Separator />
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {budgets.map((budget) => {
          const Icon = budget.icon;
          const percentage = (budget.spent / budget.total) * 100;
          return (
            <Card key={budget.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                   <CardTitle className="font-headline">{getBudgetName(budget.name)}</CardTitle>
                   <Icon className="h-6 w-6 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                 <p className="text-sm text-muted-foreground">
                  {budgetsDict.spentOf
                    .replace('{spent}', formatCurrency(budget.spent))
                    .replace('{total}', formatCurrency(budget.total))}
                </p>
                <Progress value={percentage} aria-label={`${percentage.toFixed(0)}% spent`} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
