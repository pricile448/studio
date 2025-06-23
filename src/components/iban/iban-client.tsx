
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Copy, Check, FileDown } from 'lucide-react';
import type { Dictionary } from '@/lib/dictionaries';
import { useToast } from '@/hooks/use-toast';

type IbanClientProps = {
  dict: Dictionary['iban'];
  details: {
    holder: string;
    iban: string;
    bic: string;
  };
};

export function IbanClient({ dict, details }: IbanClientProps) {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast({
      title: dict.copied,
      description: `${fieldName} ${dict.copiedDescription}`,
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownload = () => {
    const fileContent = `
Account Holder: ${details.holder}
IBAN: ${details.iban}
BIC/SWIFT: ${details.bic}
    `.trim();

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'iban_details.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">{dict.title}</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline">{dict.accountDetails}</CardTitle>
          <CardDescription>{dict.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="holder">{dict.accountHolder}</Label>
            <div className="relative">
              <Input id="holder" value={details.holder} readOnly />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="iban">{dict.iban}</Label>
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
            <Label htmlFor="bic">{dict.bic}</Label>
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
        <CardFooter>
            <Button onClick={handleDownload} variant="outline">
                <FileDown className="mr-2" />
                {dict.downloadIban}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
