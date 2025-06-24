'use client';

import { useState } from 'react';
import { type Locale } from '@/lib/dictionaries';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, ArrowLeft, ShieldCheck, ListChecks, User, FileCheck2, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface KycClientProps {
  dict: any; // Using `any` for simplicity as dict structure for kyc is new
  lang: Locale;
}

export function KycClient({ dict, lang }: KycClientProps) {
  const [step, setStep] = useState(1);
  const [docType, setDocType] = useState('');
  const [frontDocName, setFrontDocName] = useState('');
  const [backDocName, setBackDocName] = useState('');
  const [proofOfAddressName, setProofOfAddressName] = useState('');
  const [selfieName, setSelfieName] = useState('');
  
  const router = useRouter();
  const { toast } = useToast();

  const totalSteps = 5;

  const handleNext = () => {
    if (step < totalSteps -1) {
       setStep(prev => prev + 1);
    }
  };
  
  const handleBack = () => setStep(prev => prev - 1);
  
  const handleDocTypeChange = (value: string) => {
    setDocType(value);
    setFrontDocName('');
    setBackDocName('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back' | 'selfie' | 'proof') => {
    const file = e.target.files?.[0];
    if (file) {
      if (side === 'front') setFrontDocName(file.name);
      else if (side === 'back') setBackDocName(file.name);
      else if (side === 'proof') setProofOfAddressName(file.name);
      else setSelfieName(file.name);
    }
  };

  const handleSubmission = () => {
    // In a real app, this would submit all data to a backend.
    setStep(5);
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
              <h2 className="mt-4 text-2xl font-bold font-headline">{dict.step1_title}</h2>
              <p className="mt-2 text-muted-foreground">{dict.step1_desc}</p>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1"><ListChecks className="h-5 w-5 text-primary" /></div>
                <span>{dict.step1_item1}</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1"><FileText className="h-5 w-5 text-primary" /></div>
                <span>{dict.step1_item3}</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1"><User className="h-5 w-5 text-primary" /></div>
                <span>{dict.step1_item2}</span>
              </li>
            </ul>
            <Button onClick={handleNext} className="w-full">{dict.step1_button}</Button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-headline">{dict.step2_title}</h2>
            <p className="text-muted-foreground">{dict.step2_desc}</p>
            
            <RadioGroup onValueChange={handleDocTypeChange} value={docType}>
              <Label className={cn("flex items-center space-x-2 p-4 border rounded-md cursor-pointer", docType === 'passport' && 'border-primary') }>
                <RadioGroupItem value="passport" id="passport" />
                <span>{dict.step2_doc_passport}</span>
              </Label>
              <Label className={cn("flex items-center space-x-2 p-4 border rounded-md cursor-pointer", docType === 'id' && 'border-primary') }>
                <RadioGroupItem value="id" id="id" />
                <span>{dict.step2_doc_id}</span>
              </Label>
            </RadioGroup>

            {docType && (
              <div className="space-y-4">
                <Label htmlFor="front-doc" className="block p-6 border-2 border-dashed rounded-lg text-center cursor-pointer hover:border-primary">
                  <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
                  <span className="mt-2 block text-sm font-semibold">{dict.step2_upload_front}</span>
                  <span className="block text-xs text-muted-foreground">
                    {frontDocName ? dict.step2_file_selected.replace('{fileName}', frontDocName) : dict.step2_file_select}
                  </span>
                  <Input id="front-doc" type="file" className="sr-only" onChange={(e) => handleFileChange(e, 'front')} accept="image/*,.pdf"/>
                </Label>

                {docType === 'id' && (
                   <Label htmlFor="back-doc" className="block p-6 border-2 border-dashed rounded-lg text-center cursor-pointer hover:border-primary">
                    <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
                    <span className="mt-2 block text-sm font-semibold">{dict.step2_upload_back}</span>
                    <span className="block text-xs text-muted-foreground">
                        {backDocName ? dict.step2_file_selected.replace('{fileName}', backDocName) : dict.step2_file_select}
                    </span>
                    <Input id="back-doc" type="file" className="sr-only" onChange={(e) => handleFileChange(e, 'back')} accept="image/*,.pdf"/>
                  </Label>
                )}
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 w-full">
            <h2 className="text-xl font-bold font-headline">{dict.step3_title}</h2>
            <p className="text-muted-foreground">{dict.step3_desc}</p>
            <Label htmlFor="proof-doc" className="block p-6 border-2 border-dashed rounded-lg text-center cursor-pointer hover:border-primary">
              <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
              <span className="mt-2 block text-sm font-semibold">{dict.step3_upload_proof}</span>
              <span className="block text-xs text-muted-foreground">
                {proofOfAddressName ? dict.step2_file_selected.replace('{fileName}', proofOfAddressName) : dict.step2_file_select}
              </span>
              <Input id="proof-doc" type="file" className="sr-only" onChange={(e) => handleFileChange(e, 'proof')} accept="image/*,.pdf" />
            </Label>
          </div>
        );
      case 4:
         return (
          <div className="space-y-6 w-full">
            <h2 className="text-xl font-bold font-headline">{dict.step4_title}</h2>
            <p className="text-muted-foreground">{dict.step4_desc}</p>
            <Label htmlFor="selfie-doc" className="block p-6 border-2 border-dashed rounded-lg text-center cursor-pointer hover:border-primary">
              <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
              <span className="mt-2 block text-sm font-semibold">{dict.step4_upload_selfie}</span>
              <span className="block text-xs text-muted-foreground">
                {selfieName ? dict.step2_file_selected.replace('{fileName}', selfieName) : dict.step2_file_select}
              </span>
              <Input id="selfie-doc" type="file" className="sr-only" onChange={(e) => handleFileChange(e, 'selfie')} accept="image/*" />
            </Label>
          </div>
        );
      case 5:
         return (
          <div className="space-y-6 text-center py-8">
            <FileCheck2 className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-2xl font-bold font-headline">{dict.step5_title}</h2>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">{dict.step5_desc}</p>
            <Button onClick={() => router.push(`/${lang}/dashboard`)} className="w-full max-w-xs mx-auto">
              {dict.step5_button}
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="flex justify-center items-start">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          {step < totalSteps && (
            <>
            <p className="text-sm font-medium text-muted-foreground">{dict.progress.replace('{step}', step).replace('{totalSteps}', totalSteps -1)}</p>
            <Progress value={(step / (totalSteps - 1)) * 100} className="mt-2" />
            </>
          )}
        </CardHeader>
        <CardContent className="min-h-[400px] w-full flex items-center justify-center">
          {renderStep()}
        </CardContent>
        {step > 1 && step < totalSteps && (
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2" />
              {dict.button_back}
            </Button>

            {step === 2 && (
              <Button onClick={handleNext} disabled={!docType || !frontDocName || (docType === 'id' && !backDocName)}>
                {dict.button_next}
              </Button>
            )}

            {step === 3 && (
              <Button onClick={handleNext} disabled={!proofOfAddressName}>
                {dict.button_next}
              </Button>
            )}

            {step === 4 && (
              <Button onClick={handleSubmission} disabled={!selfieName}>
                {dict.button_submit}
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
