
'use client';

import { useState } from 'react';
import type { Dictionary, Locale } from '@/lib/dictionaries';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ShieldCheck, ListChecks, User, FileCheck2, CheckCircle, FileUp, Camera, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { uploadKycDocumentsAction } from '@/app/actions';
import { notifyAdminOfKyc } from '@/ai/flows/kyc-submission-flow';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';

interface KycClientProps {
  dict: Dictionary;
  lang: Locale;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_FILE_TYPES = [...ACCEPTED_IMAGE_TYPES, "application/pdf"];

const kycFormSchema = (dict: Dictionary['errors']) => z.object({
  idDocument: z
    .any()
    .refine((files) => files?.length === 1, dict.titles.formIncomplete)
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, dict.messages.files.sizeExceeded)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png, .webp and .pdf files are accepted."
    ),
  proofOfAddress: z
    .any()
    .refine((files) => files?.length === 1, dict.titles.formIncomplete)
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, dict.messages.files.sizeExceeded)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png, .webp and .pdf files are accepted."
    ),
  selfie: z
    .any()
    .refine((files) => files?.length === 1, dict.titles.formIncomplete)
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, dict.messages.files.sizeExceeded)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
});


export function KycClient({ dict, lang }: KycClientProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { userProfile, refreshUserProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const kycDict = dict.kyc;
  const errorDict = dict.errors;
  
  const form = useForm<z.infer<ReturnType<typeof kycFormSchema>>>({
    resolver: zodResolver(kycFormSchema(errorDict)),
    mode: 'onChange', // Validate on change to enable/disable button
  });
  
  const totalSteps = 3;

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);
  
  const convertFileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  };

  const handleSubmission = async (data: z.infer<ReturnType<typeof kycFormSchema>>) => {
    if (!userProfile) return;
    
    setIsSubmitting(true);
    try {
      const idDocument = data.idDocument[0];
      const proofOfAddress = data.proofOfAddress[0];
      const selfie = data.selfie[0];

      const [idDocumentDataUri, proofOfAddressDataUri, selfieDataUri] = await Promise.all([
          convertFileToDataUri(idDocument),
          convertFileToDataUri(proofOfAddress),
          convertFileToDataUri(selfie),
      ]);
      
      const uploadResult = await uploadKycDocumentsAction({
          userId: userProfile.uid,
          idDocumentDataUri,
          proofOfAddressDataUri,
          selfieDataUri,
      });

      if (!uploadResult.success || !uploadResult.idDocumentUrl || !uploadResult.proofOfAddressUrl || !uploadResult.selfieUrl) {
          throw new Error(uploadResult.error || "An unknown error occurred during file upload.");
      }

      const { idDocumentUrl, proofOfAddressUrl, selfieUrl } = uploadResult;

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

      await notifyAdminOfKyc({
          userId: userProfile.uid,
          userName: `${userProfile.firstName} ${userProfile.lastName}`,
          userEmail: userProfile.email,
          idDocumentUrl,
          proofOfAddressUrl,
          selfieUrl,
      });
      
      await refreshUserProfile();
      setStep(3); // Go to final confirmation step
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
                <div className="flex-shrink-0 mt-1"><FileCheck2 className="h-5 w-5 text-primary" /></div>
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
        const idDocFile = form.watch('idDocument');
        const proofFile = form.watch('proofOfAddress');
        const selfieFile = form.watch('selfie');

        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmission)} className="space-y-6 w-full">
              <h2 className="text-xl font-bold font-headline">{kycDict.step2_title}</h2>
              <p className="text-muted-foreground">{kycDict.step2_desc}</p>
            
              <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="idDocument"
                    render={({ field }) => (
                      <FormItem>
                          <Label htmlFor="id-upload" className="font-medium">{kycDict.step3_title_id}</Label>
                          <p className="text-sm text-muted-foreground mb-2">{kycDict.step3_desc}</p>
                          <FormControl>
                            <Label htmlFor="id-upload" className={cn("flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted", idDocFile?.[0] && "border-primary")}>
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  {idDocFile?.[0] ? <CheckCircle className="w-8 h-8 text-primary" /> : <FileUp className="w-8 h-8 text-muted-foreground" />}
                                  <p className="mt-2 text-sm text-muted-foreground truncate max-w-[90%]">{idDocFile?.[0]?.name || kycDict.step3_upload_button}</p>
                              </div>
                              <Input id="id-upload" type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => field.onChange(e.target.files)} />
                            </Label>
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="proofOfAddress"
                    render={({ field }) => (
                      <FormItem>
                          <Label htmlFor="proof-upload" className="font-medium">{kycDict.step4_title}</Label>
                          <p className="text-sm text-muted-foreground mb-2">{kycDict.step4_desc}</p>
                          <FormControl>
                            <Label htmlFor="proof-upload" className={cn("flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted", proofFile?.[0] && "border-primary")}>
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  {proofFile?.[0] ? <CheckCircle className="w-8 h-8 text-primary" /> : <FileUp className="w-8 h-8 text-muted-foreground" />}
                                  <p className="mt-2 text-sm text-muted-foreground truncate max-w-[90%]">{proofFile?.[0]?.name || kycDict.step3_upload_button}</p>
                              </div>
                              <Input id="proof-upload" type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => field.onChange(e.target.files)} />
                            </Label>
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="selfie"
                    render={({ field }) => (
                      <FormItem>
                          <Label htmlFor="selfie-upload" className="font-medium">{kycDict.step5_title}</Label>
                          <p className="text-sm text-muted-foreground mb-2">{kycDict.step5_desc}</p>
                          <FormControl>
                            <Label htmlFor="selfie-upload" className={cn("flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted", selfieFile?.[0] && "border-primary")}>
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {selfieFile?.[0] ? <CheckCircle className="w-8 h-8 text-primary" /> : <Camera className="w-8 h-8 text-muted-foreground" />}
                                <p className="mt-2 text-sm text-muted-foreground truncate max-w-[90%]">{selfieFile?.[0]?.name || kycDict.step3_upload_button}</p>
                              </div>
                              <Input id="selfie-upload" type="file" className="hidden" accept="image/*" onChange={(e) => field.onChange(e.target.files)} />
                            </Label>
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
               <CardFooter className="flex justify-between p-0 pt-6">
                  <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                    <ArrowLeft className="mr-2" />
                    {kycDict.button_back}
                  </Button>
                  <Button type="submit" disabled={!form.formState.isValid || isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {kycDict.button_submit}
                  </Button>
               </CardFooter>
            </form>
          </Form>
        );
      case 3:
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
            <p className="text-sm font-medium text-muted-foreground">{kycDict.progress.replace('{step}', String(step)).replace('{totalSteps}', String(totalSteps))}</p>
            <Progress value={(step / totalSteps) * 100} className="mt-2" />
            </>
          )}
        </CardHeader>
        <CardContent className="min-h-[400px] w-full flex items-center justify-center p-4 md:p-6">
          {renderStep()}
        </CardContent>
        {step === 1 && (
          <CardFooter className="flex justify-end">
            <Button onClick={handleNext}>
              {kycDict.button_next}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
