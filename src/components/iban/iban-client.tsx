
'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
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
    bankName: string;
    bankAddress: string;
    clientAddress: string;
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
    const doc = new jsPDF();
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(details.bankName, 20, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(details.bankAddress, 20, 30);
    
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(dict.title, 20, 50);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    let y = 65;
    doc.text(`${dict.accountHolder}:`, 20, y);
    doc.text(details.holder, 70, y);
    y += 10;
    
    doc.text(`${dict.iban}:`, 20, y);
    doc.text(details.iban, 70, y);
    y += 10;
    
    doc.text(`${dict.bic}:`, 20, y);
    doc.text(details.bic, 70, y);
    y += 15;
    
    doc.line(20, y-5, 190, y-5);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(dict.clientAddress, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(details.clientAddress, 20, y + 7);
    
    doc.save('AmCbunq_IBAN_Details.pdf');
  };

  return (
      <Card className="max-w-2xl shadow-lg">
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
  );
}
