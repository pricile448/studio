
import { type Locale, type Dictionary } from '@/lib/dictionaries';
import en from '@/dictionaries/en.json';
import fr from '@/dictionaries/fr.json';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, ShoppingCart, Clapperboard, Car } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const mockBudgets = [
  { id: '1', name: 'groceries', spent: 350.50, total: 500, icon: ShoppingCart },
  { id: '2', name: 'entertainment', spent: 120.00, total: 200, icon: Clapperboard },
  { id: '3', name: 'transport', spent: 180.75, total: 250, icon: Car },
];

export default async function BudgetsPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict: Dictionary = lang === 'fr' ? fr : en;
  const budgetsDict = dict.budgets;

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
        <Button>
          <PlusCircle className="mr-2" />
          {budgetsDict.createBudget}
        </Button>
      </div>
      <Separator />
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {mockBudgets.map((budget) => {
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
