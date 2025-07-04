
'use client';

import { useState } from 'react';
import type { Locale, Dictionary } from '@/lib/dictionaries';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, PiggyBank, CreditCard, ArrowLeftRight, Scale, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { format } from 'date-fns';
import type { Account } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { runTransaction, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const accountIcons: { [key: string]: React.ElementType } = {
  checking: DollarSign,
  savings: PiggyBank,
  credit: CreditCard,
};

function InternalTransfer({ accounts, dict, lang, onTransferSuccess }: { accounts: Account[], dict: Dictionary['accounts'], lang: Locale, onTransferSuccess: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isTransferring, setIsTransferring] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  const handleTransfer = async () => {
    if (!user || !fromAccountId || !toAccountId || !amount) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Veuillez remplir tous les champs.' });
      return;
    }
    const transferAmount = parseFloat(amount);
    if (transferAmount <= 0) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Le montant doit être positif.' });
      return;
    }
    if (fromAccountId === toAccountId) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Les comptes ne peuvent pas être identiques.' });
      return;
    }

    setIsTransferring(true);
    try {
        const userRef = doc(db, "users", user.uid);
        await runTransaction(db, async (transaction) => {
            const userSnap = await transaction.get(userRef);
            if (!userSnap.exists()) {
                throw new Error("Utilisateur non trouvé.");
            }

            const userData = userSnap.data();
            const currentAccounts: Account[] = userData.accounts || [];

            const fromAccountIndex = currentAccounts.findIndex(acc => acc.id === fromAccountId);
            const toAccountIndex = currentAccounts.findIndex(acc => acc.id === toAccountId);

            if (fromAccountIndex === -1 || toAccountIndex === -1) {
                throw new Error("Un ou plusieurs comptes sont introuvables.");
            }
            
            if (currentAccounts[fromAccountIndex].balance < transferAmount) {
                throw new Error("Solde insuffisant sur le compte de départ.");
            }

            // Update balances
            currentAccounts[fromAccountIndex].balance -= transferAmount;
            currentAccounts[toAccountIndex].balance += transferAmount;
            
            // Create transactions
            const now = Timestamp.now();
            const fromAccountName = currentAccounts[fromAccountIndex].name === 'checking' ? 'Compte Courant' : (currentAccounts[fromAccountIndex].name === 'savings' ? 'Compte Épargne' : 'Carte de Crédit');
            const toAccountName = currentAccounts[toAccountIndex].name === 'checking' ? 'Compte Courant' : (currentAccounts[toAccountIndex].name === 'savings' ? 'Compte Épargne' : 'Carte de Crédit');

            const debitTransaction = {
                id: `txn_d_${Date.now()}`,
                accountId: fromAccountId,
                date: now,
                description: `Virement vers ${toAccountName}`,
                amount: -transferAmount,
                currency: 'EUR',
                category: 'Virement interne',
                status: 'completed'
            };
            
            const creditTransaction = {
                id: `txn_c_${Date.now()}`,
                accountId: toAccountId,
                date: now,
                description: `Virement depuis ${fromAccountName}`,
                amount: transferAmount,
                currency: 'EUR',
                category: 'Virement interne',
                status: 'completed'
            };

            const transactions = userData.transactions ? [...userData.transactions, debitTransaction, creditTransaction] : [debitTransaction, creditTransaction];
            
            transaction.update(userRef, {
                accounts: currentAccounts,
                transactions: transactions
            });
        });

      toast({ title: 'Succès', description: 'Le virement interne a été effectué.' });
      setFromAccountId('');
      setToAccountId('');
      setAmount('');
      onTransferSuccess();

    } catch (error) {
      console.error("Internal Transfer Error:", error);
      toast({ variant: 'destructive', title: 'Erreur de virement', description: (error as Error).message || 'Une erreur inconnue est survenue.' });
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict.internalTransferTitle}</CardTitle>
        <CardDescription>{dict.internalTransferDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
         <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from">{dict.fromAccount}</Label>
              <Select value={fromAccountId} onValueChange={setFromAccountId} disabled={accounts.length === 0}>
                <SelectTrigger id="from">
                  <SelectValue placeholder={dict.fromAccount} />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id} disabled={account.status !== 'active'}>
                      {dict[account.name as keyof typeof dict]} - {formatCurrency(account.balance)} {account.status !== 'active' && "(Suspendu)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="to">{dict.toAccount}</Label>
              <Select value={toAccountId} onValueChange={setToAccountId} disabled={accounts.length === 0}>
                <SelectTrigger id="to">
                  <SelectValue placeholder={dict.toAccount} />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id} disabled={account.status !== 'active'}>
                       {dict[account.name as keyof typeof dict]} - {formatCurrency(account.balance)} {account.status !== 'active' && "(Suspendu)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">{dict.transferAmount}</Label>
            <Input id="amount" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={accounts.length === 0} />
          </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleTransfer} disabled={accounts.length === 0 || isTransferring || !fromAccountId || !toAccountId || !amount}>
          {isTransferring ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeftRight className="mr-2 h-4 w-4" />}
          {dict.submitTransfer}
        </Button>
      </CardFooter>
    </Card>
  );
}

export function AccountsClient({ dict, lang }: { dict: Dictionary, lang: Locale }) {
  const { userProfile, loading, refreshUserProfile } = useAuth();

  if (loading || !userProfile || !dict) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <Separator />
        <Skeleton className="h-28" />
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-80" />
      </div>
    );
  }
  
  const accounts = userProfile.accounts || [];
  const transactions = userProfile.transactions || [];
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  const accountsDict = dict.accounts;

  const getAccountName = (name: string) => {
    const key = name as keyof typeof accountsDict;
    return accountsDict[key] || name;
  }
  
  const chronoSortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const totalTransactionAmount = chronoSortedTransactions.reduce((acc, tx) => acc + tx.amount, 0);
  const initialBalance = totalBalance - totalTransactionAmount;
  
  let currentBalance = initialBalance;
  const ledger = chronoSortedTransactions.map(tx => {
      currentBalance += tx.amount;
      return {
          ...tx,
          date: format(new Date(tx.date), 'yyyy-MM-dd'),
          credit: tx.amount > 0 ? tx.amount : 0,
          debit: tx.amount < 0 ? Math.abs(tx.amount) : 0,
          balance: currentBalance
      };
  }).reverse(); // Show most recent first

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold font-headline">{accountsDict.title}</h1>
      </div>
      <Separator />

      <Card className="bg-primary text-primary-foreground">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium font-headline">{accountsDict.totalBalance}</CardTitle>
          <Scale className="h-5 w-5 text-primary-foreground/80" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatCurrency(totalBalance)}</div>
          <p className="text-xs text-primary-foreground/80">{accountsDict.totalBalanceDescription}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {accounts.map((account) => {
          const Icon = accountIcons[account.name] || DollarSign;
          return (
            <Card key={account.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium font-headline">{getAccountName(account.name)}</CardTitle>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">{formatCurrency(account.balance)}</div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/${lang}/accounts/${account.id}`}>
                    {accountsDict.details}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <InternalTransfer accounts={accounts} dict={accountsDict} lang={lang} onTransferSuccess={refreshUserProfile} />
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{accountsDict.accountingTitle}</CardTitle>
        </CardHeader>
        <CardContent>
           {/* Desktop Table */}
           <div className="hidden md:block">
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{dict.history.table.date}</TableHead>
                  <TableHead>{dict.history.table.description}</TableHead>
                  <TableHead className="text-right">{dict.accounts.creditLedger}</TableHead>
                  <TableHead className="text-right">{dict.accounts.debitLedger}</TableHead>
                  <TableHead className="text-right">{dict.accounts.balanceLedger}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.length > 0 ? ledger.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell className="text-right text-accent">{entry.credit > 0 ? formatCurrency(entry.credit) : '-'}</TableCell>
                    <TableCell className="text-right text-destructive">{entry.debit > 0 ? formatCurrency(entry.debit) : '-'}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(entry.balance)}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                          {dict.history.noTransactions}
                      </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
           </div>
           
            {/* Mobile Cards */}
            <div className="md:hidden">
              <div className="space-y-4">
                {ledger.length > 0 ? ledger.map((entry) => (
                  <div key={entry.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <div className="font-semibold">{entry.description}</div>
                        <div className="text-sm text-muted-foreground">{entry.date}</div>
                      </div>
                      <div className="text-right shrink-0">
                        {entry.credit > 0 ? (
                          <div className="font-semibold text-accent">{formatCurrency(entry.credit)}</div>
                        ) : (
                          <div className="font-semibold text-destructive">{formatCurrency(entry.debit)}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm flex justify-between items-center pt-3 border-t">
                      <span className="text-muted-foreground">{dict.accounts.balanceLedger}</span>
                      <span className="font-semibold">{formatCurrency(entry.balance)}</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-muted-foreground py-12">
                    <p>{dict.history.noTransactions}</p>
                  </div>
                )}
              </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
