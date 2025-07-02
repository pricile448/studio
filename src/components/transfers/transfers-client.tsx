
'use client';

import { useState } from 'react';
import type { Dictionary, Locale } from '@/lib/dictionaries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ArrowRightLeft, Loader2, Trash2 } from 'lucide-react';
import { AddBeneficiaryDialog } from './add-beneficiary-dialog';
import { useAuth } from '@/context/auth-context';
import { KycPrompt } from '../ui/kyc-prompt';
import { KycPendingPrompt } from '../ui/kyc-pending-prompt';
import { Skeleton } from '../ui/skeleton';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import type { Beneficiary } from '@/lib/firebase/firestore';


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
  const { userProfile, loading, requestTransfer, refreshUserProfile, deleteBeneficiary } = useAuth();
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
      amount: '' as any,
      description: ''
    }
  });
  
  const handleFormSubmit = (data: TransferFormValues) => {
    setTransferData(data);
    setIsConfirming(true);
  }

  const handleTransfer = async () => {
    if (!transferData || !userProfile) return;
    
    const selectedBeneficiary = userProfile.beneficiaries.find(b => b.id === transferData.toBeneficiaryId);

    setIsSubmitting(true);
    setIsConfirming(false);

    try {
      await requestTransfer({
        accountId: transferData.fromAccountId,
        amount: transferData.amount,
        currency: 'EUR',
        description: transferData.description || '',
        category: 'Virement sortant',
        beneficiaryId: transferData.toBeneficiaryId,
        beneficiaryName: selectedBeneficiary?.name || 'N/A'
      });
      toast({
        title: "Demande de virement envoyée",
        description: 'Votre demande de virement a été envoyée et est en attente de validation.',
      });
      form.reset({
          fromAccountId: '',
          toBeneficiaryId: '',
          amount: '' as any,
          description: ''
      });
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

  const handleDeleteBeneficiary = async (beneficiaryId: string) => {
    try {
        await deleteBeneficiary(beneficiaryId);
        toast({
            title: "Bénéficiaire supprimé",
            description: "Le bénéficiaire a été supprimé avec succès."
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Erreur',
            description: (error as Error).message || 'Une erreur est survenue lors de la suppression.',
        });
    }
  }


  if (loading || !userProfile) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <Skeleton className="h-8 w-48" />
            </div>
            <Separator />
            <div className="grid gap-8 lg:grid-cols-5">
                <Skeleton className="h-96 lg:col-span-3" />
                <Skeleton className="h-80 lg:col-span-2" />
            </div>
            <Skeleton className="h-48" />
        </div>
    )
  }

  const accounts = userProfile.accounts || [];
  const beneficiaries = userProfile.beneficiaries || [];
  const transfersToTrack = (userProfile.transactions || [])
    .filter(tx => tx.type === 'outgoing_transfer' && (tx.status === 'pending' || tx.status === 'in_progress'))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


  const getStatusInfo = (status: string) => {
    const key = status.toLowerCase() as keyof typeof dict.history.table.statuses;
    switch(key) {
        case 'completed': return { text: dict.history.table.statuses[key], className: 'bg-green-100 text-green-800 border-green-200'};
        case 'pending': return { text: dict.history.table.statuses[key], className: 'bg-amber-100 text-amber-800 border-amber-200'};
        case 'in_progress': return { text: dict.history.table.statuses[key], className: 'bg-blue-100 text-blue-800 border-blue-200'};
        case 'failed': return { text: dict.history.table.statuses[key], className: 'bg-red-100 text-red-800 border-red-200'};
        default: return { text: status, className: 'bg-gray-100 text-gray-800 border-gray-200'};
    }
  }

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

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(amount);
    };
    
    const getAccountName = (name: string) => {
      const key = name as keyof typeof dict.accounts;
      return dict.accounts[key] || name;
    }

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
            <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>{transfersDict.newTransfer}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid gap-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="fromAccountId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{transfersDict.from}</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
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
                                <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder={transfersDict.selectBeneficiary} /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {displayBeneficiaries.map(beneficiary => (
                                      <SelectItem key={beneficiary.id} value={beneficiary.id}>
                                          {beneficiary.name}
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

            <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg">Liste des bénéficiaires</CardTitle>
                    <AddBeneficiaryDialog dict={transfersDict} onBeneficiaryAdded={refreshUserProfile} />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                      {beneficiaries.length > 0 ? beneficiaries.map(b => (
                        <div key={b.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                          <div>
                            <p className="font-semibold">{b.name}</p>
                            <p className="text-sm text-muted-foreground font-mono">{b.iban}</p>
                          </div>
                           <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                      <AlertDialogTitle>Supprimer {b.name} ?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Êtes-vous sûr de vouloir supprimer ce bénéficiaire ? Cette action est définitive.
                                      </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteBeneficiary(b.id)} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )) : (
                        <p className="text-muted-foreground text-center py-8">Aucun bénéficiaire enregistré.</p>
                      )}
                    </div>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Suivi de virement</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{transfersDict.to}</TableHead>
                            <TableHead className="text-right">{dict.history.table.amount}</TableHead>
                            <TableHead className="text-right">{dict.history.table.status}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transfersToTrack.length > 0 ? transfersToTrack.map(tx => {
                            const statusInfo = getStatusInfo(tx.status);
                            return (
                            <TableRow key={tx.id}>
                                <TableCell>{tx.beneficiaryName}</TableCell>
                                <TableCell className="text-right font-medium">{formatCurrency(tx.amount)}</TableCell>
                                <TableCell className="text-right">
                                    {tx.status === 'in_progress' ? (
                                        <div className="flex items-center justify-end gap-2 text-blue-800 dark:text-blue-300">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="font-medium">{statusInfo.text}</span>
                                        </div>
                                    ) : (
                                        <Badge variant="outline" className={cn(statusInfo.className, "dark:bg-transparent")}>
                                            {statusInfo.text}
                                        </Badge>
                                    )}
                                </TableCell>
                            </TableRow>
                            )
                        }) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground h-24">{transfersDict.noRecentTransfers}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold font-headline">{transfersDict.title}</h1>
            </div>
            <Separator />
            {renderContent()}
        </div>
        <AlertDialog open={isConfirming} onOpenChange={setIsConfirming}>
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
    </>
  );
}
