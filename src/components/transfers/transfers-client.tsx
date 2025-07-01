
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
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

type TransfersClientProps = {
  dict: Dictionary;
  lang: Locale;
};

export function TransfersClient({ dict, lang }: TransfersClientProps) {
  const { userProfile, loading, requestTransfer, refreshUserProfile } = useAuth();
  const { toast } = useToast();

  const [fromAccountId, setFromAccountId] = useState('');
  const [toBeneficiaryId, setToBeneficiaryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const transfersDict = dict.transfers;
  const kycDict = dict.kyc;

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!fromAccountId || !toBeneficiaryId || !amount || isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs correctement.',
      });
      return;
    }
    
    const selectedBeneficiary = userProfile?.beneficiaries.find(b => b.id === toBeneficiaryId);

    setIsSubmitting(true);
    try {
      await requestTransfer({
        accountId: fromAccountId,
        amount: numericAmount,
        currency: 'EUR',
        description,
        category: 'Virement externe',
        beneficiaryId: toBeneficiaryId,
        beneficiaryName: selectedBeneficiary?.name || 'N/A'
      });
      toast({
        title: 'Virement en attente',
        description: 'Votre demande de virement a été envoyée et est en attente de validation.',
      });
      // Reset form
      setFromAccountId('');
      setToBeneficiaryId('');
      setAmount('');
      setDescription('');
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
               <Alert variant="info">
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>
                  Pour des raisons de sécurité, tous les virements externes sont soumis à une validation par nos équipes. Votre demande sera traitée dans les plus brefs délais.
                </AlertDescription>
              </Alert>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTransfer} className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <Label htmlFor="from">{transfersDict.from}</Label>
                    <Select value={fromAccountId} onValueChange={setFromAccountId} required>
                      <SelectTrigger id="from">
                        <SelectValue placeholder={transfersDict.selectAccount} />
                      </SelectTrigger>
                      <SelectContent>
                        {displayAccounts.map(account => (
                          <SelectItem key={account.id} value={account.id}>
                            {getAccountName(account.name)} - {formatCurrency(account.balance)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                   <div className="space-y-2">
                     <Label htmlFor="to">{transfersDict.to}</Label>
                     <Select value={toBeneficiaryId} onValueChange={setToBeneficiaryId} required>
                      <SelectTrigger id="to">
                        <SelectValue placeholder={transfersDict.selectBeneficiary} />
                      </SelectTrigger>
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
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">{transfersDict.amount}</Label>
                  <Input id="amount" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="description">{transfersDict.description}</Label>
                  <Textarea id="description" placeholder={transfersDict.descriptionPlaceholder} value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <Button type="submit" className="w-full md:w-auto justify-self-start" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRightLeft className="mr-2" />}
                  {transfersDict.submit}
                </Button>
              </form>
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
                            <p className="font-medium">{tx.description}</p>
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline">{transfersDict.title}</h1>
            <p className="mt-1 text-muted-foreground">{transfersDict.newTransferDescription}</p>
        </div>
        {userProfile.kycStatus === 'verified' && <AddBeneficiaryDialog dict={transfersDict} onBeneficiaryAdded={refreshUserProfile} />}
      </div>
      <Separator />
      {renderContent()}
    </div>
  );
}
