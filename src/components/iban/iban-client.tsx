

'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Copy, Check, FileDown } from 'lucide-react';
import type { Dictionary, Locale } from '@/lib/dictionaries';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { KycPrompt } from '@/components/ui/kyc-prompt';
import { KycPendingPrompt } from '@/components/ui/kyc-pending-prompt';
import { Skeleton } from '@/components/ui/skeleton';
import { IbanPendingPrompt } from '../ui/iban-pending-prompt';

type IbanClientProps = {
  dict: Dictionary;
  lang: Locale;
  details: {
    holder: string;
    iban: string;
    bic: string;
    bankName: string;
    bankAddress: string;
    clientAddress: string;
  };
};

export function IbanClient({ dict, lang, details }: IbanClientProps) {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { userProfile, loading } = useAuth();

  const ibanDict = dict.iban;
  const kycDict = dict.kyc;

  if (loading || !userProfile) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-full max-w-sm mt-2" />
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-36" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (userProfile.kycStatus === 'pending') {
    return <KycPendingPrompt 
      lang={lang} 
      title={kycDict.pending_title}
      description={kycDict.pending_description}
      buttonText={kycDict.step6_button}
    />;
  }

  if (userProfile.kycStatus !== 'verified') {
    return <KycPrompt 
      lang={lang} 
      title={ibanDict.unverified_title}
      description={ibanDict.unverified_description}
      buttonText={kycDict.unverified_button}
    />;
  }
  
  if (userProfile.kycStatus === 'verified' && !userProfile.iban) {
    return <IbanPendingPrompt
      lang={lang}
      title={ibanDict.pending_title}
      description={ibanDict.pending_description}
      buttonText={ibanDict.pending_button}
    />
  }
  
  const userDetails = {
    ...details,
    holder: userProfile.billingHolder || `${userProfile.firstName} ${userProfile.lastName}`,
    clientAddress: userProfile.address,
    iban: userProfile.iban || details.iban,
    bic: userProfile.bic || details.bic,
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast({
      title: ibanDict.copied,
      description: `${fieldName} ${ibanDict.copiedDescription}`,
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(userDetails.bankName, 20, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(userDetails.bankAddress, 20, 30);
    
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(ibanDict.title, 20, 50);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    let y = 65;
    doc.text(`${ibanDict.accountHolder}:`, 20, y);
    doc.text(userDetails.holder, 70, y);
    y += 10;
    
    doc.text(`${ibanDict.iban}:`, 20, y);
    doc.text(userDetails.iban, 70, y);
    y += 10;
    
    doc.text(`${ibanDict.bic}:`, 20, y);
    doc.text(userDetails.bic, 70, y);
    y += 15;
    
    doc.line(20, y-5, 190, y-5);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(ibanDict.clientAddress, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(userDetails.clientAddress, 20, y + 7);
    
    doc.save('AmCbunq_IBAN_Details.pdf');
  };

  return (
      <Card className="max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">{ibanDict.accountDetails}</CardTitle>
          <CardDescription>{userProfile.billingText || ibanDict.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="holder">{ibanDict.accountHolder}</Label>
            <div className="relative">
              <Input id="holder" value={userDetails.holder} readOnly />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="iban">{ibanDict.iban}</Label>
            <div className="relative">
              <Input id="iban" value={userDetails.iban} readOnly />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => handleCopy(userDetails.iban, 'IBAN')}
              >
                {copiedField === 'IBAN' ? <Check className="text-green-500" /> : <Copy />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bic">{ibanDict.bic}</Label>
            <div className="relative">
              <Input id="bic" value={userDetails.bic} readOnly />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => handleCopy(userDetails.bic, 'BIC')}
              >
                {copiedField === 'BIC' ? <Check className="text-green-500" /> : <Copy />}
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleDownload} variant="outline">
                <FileDown className="mr-2" />
                {ibanDict.downloadIban}
            </Button>
        </CardFooter>
      </Card>
  );
}
