
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getFinancialInsights, type FinancialInsightsInput, type FinancialInsightsOutput } from '@/ai/flows/financial-insights';
import { Sparkles, Lightbulb, AlertTriangle, Loader2 } from 'lucide-react';
import type { Dictionary } from '@/lib/dictionaries';

type AiAssistantProps = {
  dict: Dictionary['dashboard']['aiAssistant'];
  financialData: FinancialInsightsInput;
};

export function AiAssistant({ dict, financialData }: AiAssistantProps) {
  const [isPending, startTransition] = useTransition();
  const [insights, setInsights] = useState<FinancialInsightsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetInsights = () => {
    startTransition(async () => {
      setError(null);
      setInsights(null);
      try {
        const result = await getFinancialInsights(financialData);
        setInsights(result);
      } catch (e) {
        console.error(e);
        setError(dict.noInsights);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <CardTitle className="font-headline">{dict.title}</CardTitle>
        </div>
        <CardDescription>{dict.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {!isPending && !insights && !error && (
          <Button onClick={handleGetInsights} disabled={isPending}>
            <Sparkles className="mr-2 h-4 w-4" />
            {dict.button}
          </Button>
        )}

        {isPending && (
          <div className="flex items-center text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {dict.loading}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {insights && (
          <div className="space-y-4">
            <h3 className="font-semibold font-headline">{dict.insightsTitle}</h3>
            {insights.overspendingDetected && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{dict.overspendingAlert}</AlertTitle>
              </Alert>
            )}
            {insights.savingsOpportunitiesDetected && (
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>{dict.savingsAlert}</AlertTitle>
              </Alert>
            )}
            <ul className="list-disc space-y-2 pl-5 text-sm">
              {insights.insights.map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
             <Button variant="outline" onClick={() => setInsights(null)}>
                Close
             </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
