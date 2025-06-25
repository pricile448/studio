
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Dictionary, Locale } from '@/lib/dictionaries';
import type { Budget, Transaction } from '@/lib/firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, ShoppingCart, Clapperboard, Car, Utensils, PieChart, Loader2 } from 'lucide-react';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { KycPrompt } from '@/components/ui/kyc-prompt';
import { KycPendingPrompt } from '@/components/ui/kyc-pending-prompt';

const budgetSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  total: z.coerce.number().positive({ message: 'Amount must be a positive number.' }),
  category: z.string().min(2, { message: 'Category must be at least 2 characters.' }),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

const categoryIcons: { [key: string]: React.ElementType } = {
  groceries: ShoppingCart,
  entertainment: Clapperboard,
  transport: Car,
  food: Utensils,
  default: Utensils,
};

export function BudgetsClient({ dict, lang, budgets, transactions }: { dict: Dictionary, lang: Locale, budgets: Budget[], transactions: Transaction[] }) {
  const { userProfile, updateUserProfileData } = useAuth();
  const budgetsDict = dict.budgets;
  const kycDict = dict.kyc;
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { name: '', total: 0, category: '' },
  });

  if (!userProfile) {
    // Should be caught by the layout, but as a fallback.
    return null;
  }

  const onSubmit = async (data: BudgetFormValues) => {
    setIsSubmitting(true);
    const newBudget: Budget = {
      id: `bud_${Date.now()}`,
      name: data.name,
      total: data.total,
      category: data.category,
    };
    
    try {
      const updatedBudgets = [...(userProfile.budgets || []), newBudget];
      await updateUserProfileData({ budgets: updatedBudgets });
      
      toast({
        title: budgetsDict.budgetCreated,
        description: budgetsDict.budgetCreatedDescription.replace('{name}', data.name),
      });
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: (error as Error).message || 'Failed to create budget.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  const budgetsWithSpent = budgets.map(budget => {
      const spent = transactions
          .filter(tx => tx.category.toLowerCase() === budget.category.toLowerCase() && tx.amount < 0)
          .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      const Icon = categoryIcons[budget.category.toLowerCase() as keyof typeof categoryIcons] || categoryIcons.default;
      return { ...budget, spent, Icon };
  });

  const renderContent = () => {
    if (userProfile.kycStatus === 'pending') {
      return <KycPendingPrompt 
        lang={lang}
        title={kycDict.pending_title}
        description={kycDict.pending_description}
        buttonText={kycDict.step6_button}
      />
    }

    if (userProfile.kycStatus !== 'verified') {
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
            {budgetsWithSpent.map((budget) => {
            const { Icon } = budget;
            const percentage = budget.total > 0 ? (budget.spent / budget.total) * 100 : 0;
            return (
                <Card key={budget.id}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                    <CardTitle className="font-headline">{budget.name}</CardTitle>
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
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{dict.history.table.category}</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., food, transport" {...field} />
                          </FormControl>
                           <FormDescription>This must match a transaction category to track spending.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="secondary" disabled={isSubmitting}>{dict.transfers.cancelButton}</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {budgetsDict.saveBudgetButton}
                    </Button>
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
