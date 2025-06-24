
'use client';

import type { Dictionary, Locale } from '@/lib/dictionaries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ArrowRightLeft } from 'lucide-react';
import { AddBeneficiaryDialog } from './add-beneficiary-dialog';
import { useAuth } from '@/context/auth-context';
import { KycPrompt } from '../ui/kyc-prompt';
import { KycPendingPrompt } from '../ui/kyc-pending-prompt';
import { Skeleton } from '../ui/skeleton';


type TransfersClientProps = {
  dict: Dictionary;
  accountsDict: Dictionary['accounts'];
  accounts: { id: string; name: string; balance: number }[];
  recentTransfers: { id: string; date: string; description: string; amount: number }[];
  beneficiaries: { id: string; name: string; iban: string }[];
  lang: Locale;
};

export function TransfersClient({ dict, accountsDict, accounts, recentTransfers, beneficiaries, lang }: TransfersClientProps) {
  const { userProfile, loading } = useAuth();

  const transfersDict = dict.transfers;
  const kycDict = dict.kyc;

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

  const renderContent = () => {
    if (userProfile.kycStatus === 'pending') {
      return <KycPendingPrompt 
        lang={lang} 
        title={kycDict.pending_title}
        description={kycDict.pending_description}
        buttonText={kycDict.step5_button}
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
      const key = name as keyof typeof accountsDict;
      return accountsDict[key] || name;
    }

    return (
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">{transfersDict.newTransfer}</CardTitle>
              <CardDescription>{transfersDict.newTransferDescription}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="from">{transfersDict.from}</Label>
                  <Select>
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
                   <Select>
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
                <Input id="amount" type="number" placeholder="0.00" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="description">{transfersDict.description}</Label>
                <Textarea id="description" placeholder={transfersDict.descriptionPlaceholder} />
              </div>
              <Button className="w-full md:w-auto">
                <ArrowRightLeft className="mr-2" />
                {transfersDict.submit}
              </Button>
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
        <h1 className="text-3xl font-bold font-headline">{transfersDict.title}</h1>
        {userProfile.kycStatus === 'verified' && <AddBeneficiaryDialog dict={transfersDict} />}
      </div>
      <Separator />
      {renderContent()}
    </div>
  );
}
