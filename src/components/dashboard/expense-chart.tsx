
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import type { Dictionary } from '@/lib/dictionaries';
import { useIsMobile } from '@/hooks/use-mobile';
import { Progress } from '@/components/ui/progress';

const chartConfig = {
  expenses: {
    label: 'Expenses',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

interface ExpenseChartProps {
    chartData: { category: string; expenses: number }[];
    dict: Dictionary['dashboard'];
}

export function ExpenseChart({ chartData, dict }: ExpenseChartProps) {
    const isMobile = useIsMobile();

    if (chartData.length === 0) {
        return (
            <div className="flex h-[200px] items-center justify-center text-center text-muted-foreground">
                <p>{dict.noExpenseData}</p>
            </div>
        );
    }
    
    // For mobile, display a more compact list with progress bars
    if (isMobile) {
        const totalExpenses = chartData.reduce((acc, item) => acc + item.expenses, 0);

        return (
            <div className="space-y-4">
                {chartData.map((item) => {
                    const percentage = totalExpenses > 0 ? (item.expenses / totalExpenses) * 100 : 0;
                    return (
                        <div key={item.category}>
                            <div className="flex justify-between text-sm mb-1 gap-2">
                                <span className="font-medium truncate pr-2">{item.category}</span>
                                <span className="text-muted-foreground font-mono">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(item.expenses)}</span>
                            </div>
                            <Progress value={percentage} aria-label={`${item.category} ${percentage.toFixed(0)}%`} />
                        </div>
                    )
                })}
            </div>
        )
    }
    
    // For desktop, keep the bar chart
    return (
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="category" tickLine={false} tickMargin={10} axisLine={false} tick={false} />
                <YAxis hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
            </BarChart>
        </ChartContainer>
    );
}
