
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Dictionary, Locale } from '@/lib/dictionaries';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, ShoppingCart, Clapperboard, Car, Utensils, PieChart } from 'lucide-react';
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
import { useAuth } from '@/context/auth-context';
import { KycPrompt } from '@/components/ui/kyc-prompt';
import { KycPendingPrompt } from '@/components/ui/kyc-pending-prompt';
import { Skeleton } from '@/components/ui/skeleton';

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
  const { userProfile, loading } = useAuth();
  const budgetsDict = dict.budgets;
  const kycDict = dict.kyc;
  
  const [budgets, setBudgets] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { name: '', total: 0 },
  });

  if (loading || !userProfile) {
    return (
       <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Separator />
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

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
    return new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const getBudgetName = (name: string) => {
    const key = name as keyof typeof budgetsDict;
    return budgetsDict[key] || name;
  }

  const renderContent = () => {
    if (userProfile.kycStatus === 'pending') {
      return <KycPendingPrompt 
        lang={lang}
        title={kycDict.pending_title}
        description={kycDict.pending_description}
        buttonText={kycDict.step5_button}
      />
    }

    if (userProfile.kycStatus === 'unverified') {
      return <KycPrompt 
        lang={lang}
        title={kycDict.unverified_budgets_title}
        description={kycDict.unverified_description}
        buttonText={kycDict.unverified_button}
      />
    }
    
    if (budgets.length === 0) {
      return (
        <Card>
            <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-12">
                    <PieChart className="mx-auto h-12 w-12 mb-4" />
                    <h3 className="text-lg font-semibold">{budgetsDict.noBudgetsTitle}</h3>
                    <p className="mt-2 text-sm">{budgetsDict.noBudgetsDescription}</p>
                    <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                        <PlusCircle className="mr-2" />
                        {budgetsDict.createBudget}
                    </Button>
                </div>
            </CardContent>
        </Card>
      );
    }

    return (
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
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold font-headline">{budgetsDict.title}</h1>
        {userProfile.kycStatus === 'verified' && (
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
        )}
      </div>
      <Separator />
      {renderContent()}
    </div>
  );
}
