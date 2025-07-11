
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
import { useUserProfile } from '@/context/user-profile-context';
import { Skeleton } from '@/components/ui/skeleton';

type BillingClientProps = {
  dict: Dictionary;
};

export function BillingClient({ dict }: BillingClientProps) {
  const { userProfile, loading } = useUserProfile();
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

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
            <h1 className="text-2xl md:text-3xl font-bold font-headline"><Skeleton className="h-8 w-4/5" /></h1>
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

  // Use user-specific billing info. Fallback to default message if not configured.
  const hasBillingInfo = userProfile && userProfile.billingHolder && userProfile.billingIban;

  if (!hasBillingInfo) {
    return (
         <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold font-headline break-words">{billingDict.title}</h1>
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

  const { billingHolder, billingIban, billingBic, billingText } = userProfile;

  return (
    <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold font-headline break-words">{billingDict.title}</h1>
        <div className="flex justify-center">
            <Card className="w-full max-w-2xl shadow-lg">
                <CardHeader>
                    <CardTitle>{billingDict.cardTitle}</CardTitle>
                    <CardDescription>{billingText || billingDict.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="holder">{ibanDict.accountHolder}</Label>
                        <div className="relative">
                            <Input id="holder" value={billingHolder} readOnly />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="iban">{ibanDict.iban}</Label>
                        <div className="relative">
                            <Input id="iban" value={billingIban} readOnly />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                                onClick={() => handleCopy(billingIban || '', 'IBAN')}
                            >
                                {copiedField === 'IBAN' ? <Check className="text-green-500" /> : <Copy />}
                            </Button>
                        </div>
                    </div>
                     {billingBic && (
                        <div className="space-y-2">
                            <Label htmlFor="bic">{ibanDict.bic}</Label>
                            <div className="relative">
                                <Input id="bic" value={billingBic} readOnly />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                                    onClick={() => handleCopy(billingBic, 'BIC')}
                                >
                                    {copiedField === 'BIC' ? <Check className="text-green-500" /> : <Copy />}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
