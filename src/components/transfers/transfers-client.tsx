
'use client';

import { useState } from 'react';
import type { Dictionary, Locale } from '@/lib/dictionaries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ArrowRightLeft, Loader2 } from 'lucide-react';
import { AddBeneficiaryDialog } from './add-beneficiary-dialog';
import { useAuth } from '@/context/auth-context';
import { KycPrompt } from '../ui/kyc-prompt';
import { KycPendingPrompt } from '../ui/kyc-pending-prompt';
import { Skeleton } from '../ui/skeleton';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';


type TransfersClientProps = {
  dict: Dictionary;
  lang: Locale;
};

const transferSchema = z.object({
  fromAccountId: z.string().min(1, 'Veuillez sélectionner un compte.'),
  toBeneficiaryId: z.string().min(1, 'Veuillez sélectionner un bénéficiaire.'),
  amount: z.coerce.number().positive({ message: "Le montant doit être un nombre positif." }),
  description: z.string().optional(),
});
type TransferFormValues = z.infer<typeof transferSchema>;


export function TransfersClient({ dict, lang }: TransfersClientProps) {
  const { userProfile, loading, requestTransfer, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [transferData, setTransferData] = useState<TransferFormValues | null>(null);

  const transfersDict = dict.transfers;
  const kycDict = dict.kyc;
  
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromAccountId: '',
      toBeneficiaryId: '',
      amount: undefined,
      description: ''
    }
  });
  
  const handleFormSubmit = (data: TransferFormValues) => {
    setTransferData(data);
    setIsConfirming(true);
  }

  const handleTransfer = async () => {
    if (!transferData) return;
    
    const selectedBeneficiary = userProfile?.beneficiaries.find(b => b.id === transferData.toBeneficiaryId);

    setIsSubmitting(true);
    setIsConfirming(false);

    try {
      await requestTransfer({
        accountId: transferData.fromAccountId,
        amount: transferData.amount,
        currency: 'EUR',
        description: transferData.description || '',
        category: 'Virement externe',
        beneficiaryId: transferData.toBeneficiaryId,
        beneficiaryName: selectedBeneficiary?.name || 'N/A'
      });
      toast({
        title: 'Virement en attente',
        description: 'Votre demande de virement a été envoyée et est en attente de validation.',
      });
      // Reset form
      form.reset();
      setTransferData(null);
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Erreur',
        description: (error as Error).message || 'Une erreur est survenue lors de la demande de virement.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  if (loading || !userProfile) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-44" />
            </div>
            <Separator />
            <div className="grid gap-8 lg:grid-cols-3">
                <Skeleton className="lg:col-span-2 h-96" />
                <Skeleton className="lg:col-span-1 h-80" />
            </div>
        </div>
    )
  }

  const accounts = userProfile.accounts || [];
  const beneficiaries = userProfile.beneficiaries || [];
  const recentTransfers = (userProfile.transactions || [])
    .filter(tx => tx.type === 'external_transfer')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(tx => ({
        ...tx,
        date: format(new Date(tx.date), 'PPP', { locale: lang === 'fr' ? fr : enUS})
    }));

  const renderContent = () => {
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
        title={transfersDict.unverified_title}
        description={transfersDict.unverified_description}
        buttonText={kycDict.unverified_button}
      />;
    }

    const displayAccounts = accounts;
    const displayBeneficiaries = beneficiaries;
    const displayRecentTransfers = recentTransfers;

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(amount);
    };
    
    const getAccountName = (name: string) => {
      const key = name as keyof typeof dict.accounts;
      return dict.accounts[key] || name;
    }

    return (
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
               <CardTitle>{transfersDict.newTransfer}</CardTitle>
               <Alert variant="info" className="mt-2">
                <AlertDescription>
                  Pour votre sécurité, tous les virements externes sont soumis à une validation manuelle avant d'être exécutés.
                </AlertDescription>
               </Alert>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid gap-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="fromAccountId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{transfersDict.from}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder={transfersDict.selectAccount} /></SelectTrigger></FormControl>
                          <SelectContent>
                            {displayAccounts.map(account => (<SelectItem key={account.id} value={account.id}>{getAccountName(account.name)} - {formatCurrency(account.balance)}</SelectItem>))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name="toBeneficiaryId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{transfersDict.to}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder={transfersDict.selectBeneficiary} /></SelectTrigger></FormControl>
                          <SelectContent>
                            {displayBeneficiaries.map(beneficiary => (
                              <SelectItem key={beneficiary.id} value={beneficiary.id}>
                                <div className="flex flex-col">
                                  <span>{beneficiary.name}</span>
                                  <span className="text-xs text-muted-foreground">{beneficiary.iban}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}/>
                  </div>
                   <FormField control={form.control} name="amount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{transfersDict.amount}</FormLabel>
                      <FormControl><Input type="number" placeholder="0.00" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                   <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{transfersDict.description}</FormLabel>
                      <FormControl><Textarea placeholder={transfersDict.descriptionPlaceholder} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <Button type="submit" className="w-full md:w-auto justify-self-start" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRightLeft className="mr-2" />}
                    {transfersDict.submit}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">{transfersDict.recentTransfers}</CardTitle>
            </CardHeader>
            <CardContent>
              {displayRecentTransfers.length > 0 ? (
                 <div className="space-y-4">
                    {displayRecentTransfers.map((tx, index) => (
                    <div key={tx.id}>
                        <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">{tx.beneficiaryName}</p>
                            <p className="text-sm text-muted-foreground">{tx.date}</p>
                        </div>
                        <p className="font-semibold">{formatCurrency(tx.amount)}</p>
                        </div>
                        {index < displayRecentTransfers.length - 1 && <Separator className="my-4" />}
                    </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{transfersDict.noRecentTransfers}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <AlertDialog open={isConfirming} onOpenChange={setIsConfirming}>
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-headline">{transfersDict.title}</h1>
                </div>
                {userProfile.kycStatus === 'verified' && <AddBeneficiaryDialog dict={transfersDict} onBeneficiaryAdded={refreshUserProfile} />}
            </div>
            <Separator />
            {renderContent()}
        </div>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Confirmer le virement ?</AlertDialogTitle>
                <AlertDialogDescription>
                    Pour des raisons de sécurité, votre virement sera soumis à une validation par nos équipes avant d'être exécuté. Le montant ne sera pas débité immédiatement. Voulez-vous continuer ?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setTransferData(null)}>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleTransfer} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : "Confirmer et envoyer pour validation"}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );
}
