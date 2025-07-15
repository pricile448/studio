
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
import { submitKycAndNotifyAdmin } from '@/ai/flows/kyc-submission-flow';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { updateUserInFirestore } from '@/lib/firebase/firestore';


interface KycClientProps {
  dict: Dictionary;
  lang: Locale;
}

export function KycClient({ dict, lang }: KycClientProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [files, setFiles] = useState<{
    idDocument?: File,
    proofOfAddress?: File,
    selfie?: File
  }>({});

  const { user, userProfile, refreshUserProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const kycDict = dict.kyc;
  const errorDict = dict.errors;
  
  const totalSteps = 3;

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'idDocument' | 'proofOfAddress' | 'selfie') => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles(prev => ({ ...prev, [field]: file }));
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

  const handleSubmit = async () => {
    if (!user || !userProfile) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Session utilisateur invalide. Veuillez vous reconnecter.' });
        return;
    }
    
    if (!files.idDocument || !files.proofOfAddress || !files.selfie) {
      toast({
        variant: 'destructive',
        title: errorDict.titles.formIncomplete,
        description: kycDict.missing_documents_desc,
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { idDocument, proofOfAddress, selfie } = files;

      const [idDocumentDataUri, proofOfAddressDataUri, selfieDataUri] = await Promise.all([
          convertFileToDataUri(idDocument),
          convertFileToDataUri(proofOfAddress),
          convertFileToDataUri(selfie),
      ]);
      
      const submissionRef = doc(db, 'kycSubmissions', userProfile.uid);
      const submissionData = {
          userId: userProfile.uid,
          userName: `${userProfile.firstName} ${userProfile.lastName}`,
          userEmail: userProfile.email,
          status: 'pending' as const,
          submittedAt: Timestamp.now(),
      };
      await setDoc(submissionRef, submissionData, { merge: true });

      await updateUserInFirestore(user.uid, {
          kycStatus: 'pending',
          kycSubmittedAt: new Date(),
      });

      const emailResult = await submitKycAndNotifyAdmin({
          userId: userProfile.uid,
          userName: `${userProfile.firstName} ${userProfile.lastName}`,
          userEmail: userProfile.email,
          idDocument: { filename: idDocument.name, data: idDocumentDataUri },
          proofOfAddress: { filename: proofOfAddress.name, data: proofOfAddressDataUri },
          selfie: { filename: selfie.name, data: selfieDataUri },
      });

      if (!emailResult.success) {
          throw new Error(emailResult.error || "Une erreur inconnue est survenue pendant l'envoi de la notification.");
      }

      await refreshUserProfile();
      setStep(4);

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

  const isStepTwoFormComplete = !!files.idDocument && !!files.proofOfAddress && !!files.selfie;

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
          </div>
        );
      case 2:
        return (
            <div className="space-y-6 w-full">
              <h2 className="text-xl font-bold font-headline">{kycDict.step2_title}</h2>
              <p className="text-muted-foreground">{kycDict.step2_desc}</p>
            
              <div className="space-y-4">
                  <div>
                      <Label htmlFor="id-upload" className="font-medium">{kycDict.step3_title_id}</Label>
                      <p className="text-sm text-muted-foreground mb-2">{kycDict.step3_desc}</p>
                        <Label htmlFor="id-upload" className={cn("flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted", files.idDocument && "border-primary")}>
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              {files.idDocument ? <CheckCircle className="w-8 h-8 text-primary" /> : <FileUp className="w-8 h-8 text-muted-foreground" />}
                              <p className="mt-2 text-sm text-muted-foreground truncate max-w-[90%]">{files.idDocument?.name || kycDict.step3_upload_button}</p>
                          </div>
                          <Input id="id-upload" type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, 'idDocument')} />
                        </Label>
                  </div>

                  <div>
                      <Label htmlFor="proof-upload" className="font-medium">{kycDict.step4_title}</Label>
                      <p className="text-sm text-muted-foreground mb-2">{kycDict.step4_desc}</p>
                        <Label htmlFor="proof-upload" className={cn("flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted", files.proofOfAddress && "border-primary")}>
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              {files.proofOfAddress ? <CheckCircle className="w-8 h-8 text-primary" /> : <FileUp className="w-8 h-8 text-muted-foreground" />}
                              <p className="mt-2 text-sm text-muted-foreground truncate max-w-[90%]">{files.proofOfAddress?.name || kycDict.step3_upload_button}</p>
                          </div>
                          <Input id="proof-upload" type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, 'proofOfAddress')} />
                        </Label>
                  </div>

                  <div>
                      <Label htmlFor="selfie-upload" className="font-medium">{kycDict.step5_title}</Label>
                      <p className="text-sm text-muted-foreground mb-2">{kycDict.step5_desc}</p>
                        <Label htmlFor="selfie-upload" className={cn("flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted", files.selfie && "border-primary")}>
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {files.selfie ? <CheckCircle className="w-8 h-8 text-primary" /> : <Camera className="w-8 h-8 text-muted-foreground" />}
                            <p className="mt-2 text-sm text-muted-foreground truncate max-w-[90%]">{files.selfie?.name || kycDict.step3_upload_button}</p>
                          </div>
                          <Input id="selfie-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'selfie')} />
                        </Label>
                  </div>
              </div>
            </div>
        );
      case 4:
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
      default:
        return null;
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
        <CardFooter className="flex justify-between">
          {step > 1 && step < 4 && (
            <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting}>
                <ArrowLeft className="mr-2" />
                {kycDict.button_back}
            </Button>
          )}
           {step === 1 && (
              <div className="flex justify-end w-full">
                <Button onClick={handleNext}>
                  {kycDict.button_next}
                </Button>
              </div>
          )}
          {step === 2 && (
             <Button type="button" onClick={handleSubmit} disabled={!isStepTwoFormComplete || isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {kycDict.button_submit}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
