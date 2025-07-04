
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import type { Dictionary } from '@/lib/dictionaries';

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
    if (chartData.length === 0) {
        return (
            <div className="flex h-[200px] items-center justify-center text-center text-muted-foreground">
                <p>{dict.noExpenseData}</p>
            </div>
        );
    }
    
    return (
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="category" tickLine={false} tickMargin={10} axisLine={false} tick={false} />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
            </BarChart>
        </ChartContainer>
    );
}
