
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Copy, Check, Info } from 'lucide-react';
import type { Dictionary } from '@/lib/dictionaries';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { getBillingConfig, type BillingConfig } from '@/lib/firebase/firestore';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

type BillingClientProps = {
  dict: Dictionary;
};

export function BillingClient({ dict }: BillingClientProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [config, setConfig] = useState<BillingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
        setLoading(true);
        getBillingConfig()
            .then(setConfig)
            .catch(error => {
                console.error("Failed to fetch billing config:", error);
                toast({
                    variant: 'destructive',
                    title: 'Erreur',
                    description: "Impossible de charger les informations de facturation."
                });
            })
            .finally(() => setLoading(false));
    }
  }, [user, toast]);

  const billingDict = dict.billing;
  const ibanDict = dict.iban;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast({
      title: ibanDict.copied,
      description: `${fieldName} ${ibanDict.copiedDescription}`,
    });
    setTimeout(() => setCopiedField(null), 2000);
  };
  
  if (loading) {
      return (
         <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">{billingDict.title}</h1>
            <div className="flex justify-center">
                <Card className="w-full max-w-2xl shadow-lg">
                    <CardHeader>
                        <Skeleton className="h-7 w-3/5" />
                        <Skeleton className="h-4 w-4/5" />
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
         </div>
      )
  }

  if (!config || !config.isEnabled) {
    return (
         <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">{billingDict.title}</h1>
            <div className="flex justify-center">
                <Alert variant="info" className="w-full max-w-2xl">
                  <Info className="h-4 w-4" />
                  <AlertTitle>{billingDict.noBillingTitle}</AlertTitle>
                  <AlertDescription>
                    {billingDict.noBillingDescription}
                  </AlertDescription>
                </Alert>
            </div>
         </div>
    );
  }

  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">{billingDict.title}</h1>
        <div className="flex justify-center">
            <Card className="w-full max-w-2xl shadow-lg">
                <CardHeader>
                    <CardTitle>{billingDict.cardTitle}</CardTitle>
                    <CardDescription>{config.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="holder">{ibanDict.accountHolder}</Label>
                        <div className="relative">
                            <Input id="holder" value={config.holder} readOnly />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="iban">{ibanDict.iban}</Label>
                        <div className="relative">
                            <Input id="iban" value={config.iban} readOnly />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                                onClick={() => handleCopy(config.iban, 'IBAN')}
                            >
                                {copiedField === 'IBAN' ? <Check className="text-green-500" /> : <Copy />}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bic">{ibanDict.bic}</Label>
                        <div className="relative">
                            <Input id="bic" value={config.bic} readOnly />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                                onClick={() => handleCopy(config.bic, 'BIC')}
                            >
                                {copiedField === 'BIC' ? <Check className="text-green-500" /> : <Copy />}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
