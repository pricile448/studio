
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Copy, Check } from 'lucide-react';
import type { Dictionary, Locale } from '@/lib/dictionaries';
import { useToast } from '@/hooks/use-toast';

type BillingClientProps = {
  dict: Dictionary;
  details: {
    holder: string;
    iban: string;
    bic: string;
  };
};

export function BillingClient({ dict, details }: BillingClientProps) {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const billingDict = dict.billing;
  const ibanDict = dict.iban; // For copied toasts

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast({
      title: ibanDict.copied,
      description: `${fieldName} ${ibanDict.copiedDescription}`,
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">{billingDict.title}</h1>
        <Card className="max-w-2xl shadow-lg">
            <CardHeader>
                <CardTitle>{billingDict.cardTitle}</CardTitle>
                <CardDescription>{billingDict.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="holder">{ibanDict.accountHolder}</Label>
                    <div className="relative">
                        <Input id="holder" value={details.holder} readOnly />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="iban">{ibanDict.iban}</Label>
                    <div className="relative">
                        <Input id="iban" value={details.iban} readOnly />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                            onClick={() => handleCopy(details.iban, 'IBAN')}
                        >
                            {copiedField === 'IBAN' ? <Check className="text-green-500" /> : <Copy />}
                        </Button>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bic">{ibanDict.bic}</Label>
                    <div className="relative">
                        <Input id="bic" value={details.bic} readOnly />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                            onClick={() => handleCopy(details.bic, 'BIC')}
                        >
                            {copiedField === 'BIC' ? <Check className="text-green-500" /> : <Copy />}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
