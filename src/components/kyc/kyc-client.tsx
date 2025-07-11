
'use client';

import { useState } from 'react';
import type { Dictionary, Locale } from '@/lib/dictionaries';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ShieldCheck, ListChecks, User, FileCheck2, FileText, CheckCircle, FileUp, Camera, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { uploadKycFiles, notifyAdminOfKyc } from '@/ai/flows/kyc-submission-flow';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface KycClientProps {
  dict: Dictionary;
  lang: Locale;
}

export function KycClient({ dict, lang }: KycClientProps) {
  const [step, setStep] = useState(1);
  const [docType, setDocType] = useState('');
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [proofOfAddress, setProofOfAddress] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { userProfile, refreshUserProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const kycDict = dict.kyc;
  const errorDict = dict.errors;

  const totalSteps = 6;

  const handleNext = () => {
    if (step < totalSteps -1) {
       setStep(prev => prev + 1);
    }
  };
  
  const handleBack = () => setStep(prev => prev - 1);
  
  const handleDocTypeChange = (value: string) => {
    setDocType(value);
  };
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ variant: 'destructive', title: errorDict.titles.fileTooLarge, description: errorDict.messages.files.sizeExceeded });
        return;
      }
      setter(file);
    }
  };

  const convertFileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  };

  const handleSubmission = async () => {
    if (!idDocument || !proofOfAddress || !selfie || !userProfile) {
      toast({
        variant: 'destructive',
        title: errorDict.titles.formIncomplete,
        description: kycDict.missing_documents_desc,
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Step 1: Convert files to Data URIs
      const [idDocumentDataUri, proofOfAddressDataUri, selfieDataUri] = await Promise.all([
          convertFileToDataUri(idDocument),
          convertFileToDataUri(proofOfAddress),
          convertFileToDataUri(selfie),
      ]);

      // Step 2: Call server flow to upload files and get URLs
      const { idDocumentUrl, proofOfAddressUrl, selfieUrl } = await uploadKycFiles({
          userId: userProfile.uid,
          idDocumentDataUri,
          proofOfAddressDataUri,
          selfieDataUri,
      });

      // Step 3: Write submission document from the CLIENT (this is the key change)
      const submissionRef = doc(db, 'kycSubmissions', userProfile.uid);
      const submissionData = {
          userId: userProfile.uid,
          userName: `${userProfile.firstName} ${userProfile.lastName}`,
          userEmail: userProfile.email,
          status: 'pending' as const,
          submittedAt: Timestamp.now(),
          documents: { idDocumentUrl, proofOfAddressUrl, selfieUrl }
      };
      await setDoc(submissionRef, submissionData);

      // Step 4: Call second server flow to notify admin (no DB write)
      await notifyAdminOfKyc({
          userId: userProfile.uid,
          userName: `${userProfile.firstName} ${userProfile.lastName}`,
          userEmail: userProfile.email,
          idDocumentUrl,
          proofOfAddressUrl,
          selfieUrl,
      });
      
      // Step 5: Refresh UI and move to final step
      await refreshUserProfile();
      setStep(6);
    } catch (error: any) {
      console.error("KYC Submission Error:", error);
      toast({
        variant: 'destructive',
        title: errorDict.titles.uploadFailed,
        description: error.message || errorDict.messages.files.uploadFailed,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
              <h2 className="mt-4 text-2xl font-bold font-headline">{kycDict.step1_title}</h2>
              <p className="mt-2 text-muted-foreground">{kycDict.step1_desc}</p>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1"><ListChecks className="h-5 w-5 text-primary" /></div>
                <span>{kycDict.step1_item1}</span>
              </li>
               <li className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1"><FileText className="h-5 w-5 text-primary" /></div>
                <span>{kycDict.step1_item3}</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1"><User className="h-5 w-5 text-primary" /></div>
                <span>{kycDict.step1_item2}</span>
              </li>
            </ul>
            <Button onClick={handleNext} className="w-full">{kycDict.step1_button}</Button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-headline">{kycDict.step2_title}</h2>
            <p className="text-muted-foreground">{kycDict.step2_desc}</p>
            
            <RadioGroup onValueChange={handleDocTypeChange} value={docType}>
              <Label className={cn("flex items-center space-x-2 p-4 border rounded-md cursor-pointer", docType === 'passport' && 'border-primary') }>
                <RadioGroupItem value="passport" id="passport" />
                <span>{kycDict.step2_doc_passport}</span>
              </Label>
              <Label className={cn("flex items-center space-x-2 p-4 border rounded-md cursor-pointer", docType === 'id' && 'border-primary') }>
                <RadioGroupItem value="id" id="id" />
                <span>{kycDict.step2_doc_id}</span>
              </Label>
            </RadioGroup>

            {docType && (
               <Alert variant="default" className="border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle>{kycDict.step2_doc_type} {docType === 'id' ? kycDict.step2_doc_id : kycDict.step2_doc_passport} {kycDict.selected}</AlertTitle>
                  <AlertDescription>
                    {kycDict.clickNext}
                  </AlertDescription>
                </Alert>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 w-full">
            <h2 className="text-xl font-bold font-headline">{docType === 'id' ? kycDict.step3_title_id : kycDict.step3_title_passport}</h2>
            <p className="text-muted-foreground">{kycDict.step3_desc}</p>
             <Label htmlFor="id-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileUp className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">{kycDict.step3_upload_button}</p>
                </div>
                <Input id="id-upload" type="file" className="hidden" onChange={(e) => handleFileSelect(e, setIdDocument)} accept="image/*,.pdf" />
            </Label>
            {idDocument && (
               <Alert variant="default" className="border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle>{kycDict.file_selected.replace('{fileName}', idDocument.name)}</AlertTitle>
                  <AlertDescription>
                    {kycDict.clickNext}
                  </AlertDescription>
                </Alert>
            )}
          </div>
        );
      case 4:
         return (
          <div className="space-y-6 w-full">
            <h2 className="text-xl font-bold font-headline">{kycDict.step4_title}</h2>
            <p className="text-muted-foreground">{kycDict.step4_desc}</p>
             <Label htmlFor="proof-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileUp className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">{kycDict.step3_upload_button}</p>
                </div>
                <Input id="proof-upload" type="file" className="hidden" onChange={(e) => handleFileSelect(e, setProofOfAddress)} accept="image/*,.pdf" />
            </Label>
            {proofOfAddress && (
               <Alert variant="default" className="border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle>{kycDict.file_selected.replace('{fileName}', proofOfAddress.name)}</AlertTitle>
                  <AlertDescription>
                    {kycDict.clickNext}
                  </AlertDescription>
                </Alert>
            )}
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 w-full">
            <h2 className="text-xl font-bold font-headline">{kycDict.step5_title}</h2>
            <p className="text-muted-foreground">{kycDict.step5_desc}</p>
             <Label htmlFor="selfie-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">{kycDict.step3_upload_button}</p>
                </div>
                <Input id="selfie-upload" type="file" className="hidden" onChange={(e) => handleFileSelect(e, setSelfie)} accept="image/*" />
            </Label>
            {selfie && (
               <Alert variant="default" className="border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle>{kycDict.file_selected.replace('{fileName}', selfie.name)}</AlertTitle>
                   <AlertDescription>
                    {kycDict.clickSubmit}
                  </AlertDescription>
                </Alert>
            )}
          </div>
        );
      case 6:
         return (
          <div className="space-y-6 text-center py-8">
            <FileCheck2 className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-2xl font-bold font-headline">{kycDict.step6_title}</h2>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">{kycDict.step6_desc}</p>
            <Button onClick={() => router.push(`/${lang}/dashboard`)} className="w-full max-w-xs mx-auto">
              {kycDict.step6_button}
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
            <p className="text-sm font-medium text-muted-foreground">{kycDict.progress.replace('{step}', String(step)).replace('{totalSteps}', String(totalSteps -1))}</p>
            <Progress value={(step / (totalSteps - 1)) * 100} className="mt-2" />
            </>
          )}
        </CardHeader>
        <CardContent className="min-h-[400px] w-full flex items-center justify-center">
          {renderStep()}
        </CardContent>
        {step > 1 && step < totalSteps && (
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
              <ArrowLeft className="mr-2" />
              {kycDict.button_back}
            </Button>

            {step === 2 && (
              <Button onClick={handleNext} disabled={!docType}>
                {kycDict.button_next}
              </Button>
            )}

            {step === 3 && (
              <Button onClick={handleNext} disabled={!idDocument}>
                {kycDict.button_next}
              </Button>
            )}
            
            {step === 4 && (
              <Button onClick={handleNext} disabled={!proofOfAddress}>
                {kycDict.button_next}
              </Button>
            )}

            {step === 5 && (
              <Button onClick={handleSubmission} disabled={!idDocument || !proofOfAddress || !selfie || isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {kycDict.button_submit}
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
