
'use client';

import { useState } from 'react';
import { type UserProfile, type Account, addFundsToAccount, debitFundsFromAccount, updateUserAccountDetails, resetAccountBalance } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Banknote, Landmark, CreditCard, Loader2, MoreVertical, Edit, Ban, RefreshCw, Trash2, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { getFirebaseServices } from '@/lib/firebase/config';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

const { db: adminDb } = getFirebaseServices('admin');

interface UserDetailClientProps {
    userProfile: UserProfile;
}

function AccountManagement({ user, onUpdate }: { user: UserProfile, onUpdate: (updatedUser: UserProfile) => void }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

    // For Edit Dialog
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [newAccountNumber, setNewAccountNumber] = useState('');

    const getAccountName = (name: string) => name === 'checking' ? 'Compte Courant' : (name === 'savings' ? 'Compte Épargne' : 'Carte de Crédit');
    
    const handleAction = async (action: () => Promise<any>, successMsg: string, errorMsg: string) => {
        setIsLoading(true);
        try {
            await action();
            const updatedProfile = { ...user };
            onUpdate(updatedProfile); // Trigger parent state update
            toast({ title: 'Succès', description: successMsg });
        } catch (error) {
            console.error(errorMsg, error);
            toast({ variant: 'destructive', title: 'Erreur', description: (error as Error).message || errorMsg });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAccount) return;
        await handleAction(
            () => updateUserAccountDetails(user.uid, selectedAccount.id, { accountNumber: newAccountNumber }, adminDb),
            'Numéro de compte mis à jour.',
            'Erreur lors de la mise à jour du numéro de compte.'
        );
        const updatedAccounts = user.accounts.map(acc => acc.id === selectedAccount.id ? { ...acc, accountNumber: newAccountNumber } : acc);
        onUpdate({ ...user, accounts: updatedAccounts });
        setIsEditOpen(false);
    }
    
    const handleToggleStatus = async (account: Account) => {
        const newStatus = account.status === 'active' ? 'suspended' : 'active';
        await handleAction(
            () => updateUserAccountDetails(user.uid, account.id, { status: newStatus }, adminDb),
            `Compte ${newStatus === 'active' ? 'réactivé' : 'suspendu'}.`,
            'Erreur lors du changement de statut du compte.'
        );
        const updatedAccounts = user.accounts.map(acc => acc.id === account.id ? { ...acc, status: newStatus } : acc);
        onUpdate({ ...user, accounts: updatedAccounts });
    };

    const handleResetBalance = async (accountId: string) => {
        await handleAction(
            () => resetAccountBalance(user.uid, accountId, adminDb),
            'Le solde du compte a été remis à zéro.',
            'Erreur lors de la remise à zéro du solde.'
        );
        const updatedAccounts = user.accounts.map(acc => acc.id === accountId ? { ...acc, balance: 0 } : acc);
        onUpdate({ ...user, accounts: updatedAccounts });
    };
    
    const getStatusVariant = (status: 'active' | 'suspended') => {
        return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Comptes de l'utilisateur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {user.accounts.map(account => (
                    <div key={account.id} className="p-4 border rounded-lg flex justify-between items-center">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <p className="font-semibold">{getAccountName(account.name)}</p>
                                <Badge variant="outline" className={cn("text-xs", getStatusVariant(account.status))}>
                                  {account.status === 'active' ? 'Actif' : 'Suspendu'}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground font-mono tracking-wider">{account.accountNumber}</p>
                            <p className="text-xl font-bold">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(account.balance)}</p>
                        </div>
                        <Dialog open={isEditOpen && selectedAccount?.id === account.id} onOpenChange={(open) => { if (!open) setIsEditOpen(false); }}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" disabled={isLoading}>
                                        <MoreVertical />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DialogTrigger asChild onSelect={(e) => e.preventDefault()}>
                                        <DropdownMenuItem onClick={() => { setSelectedAccount(account); setNewAccountNumber(account.accountNumber); setIsEditOpen(true);}}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>Modifier</span>
                                        </DropdownMenuItem>
                                    </DialogTrigger>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                             <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                {account.status === 'active' ? <Ban className="mr-2 h-4 w-4" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                                <span>{account.status === 'active' ? 'Suspendre' : 'Réactiver'}</span>
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Confirmer l'action</AlertDialogTitle></AlertDialogHeader>
                                            <AlertDialogDescription>Êtes-vous sûr de vouloir {account.status === 'active' ? 'suspendre' : 'réactiver'} ce compte ?</AlertDialogDescription>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleToggleStatus(account)}>Confirmer</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}><Trash2 className="mr-2 h-4 w-4" /><span>Remettre à zéro</span></DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Confirmer la remise à zéro</AlertDialogTitle></AlertDialogHeader>
                                            <AlertDialogDescription>Cette action est irréversible et mettra le solde du compte à 0. Un ajustement sera enregistré dans les transactions.</AlertDialogDescription>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleResetBalance(account.id)}>Confirmer la remise à zéro</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Modifier le compte</DialogTitle>
                                    <DialogDescription>Mettre à jour le numéro de compte pour {getAccountName(account.name)}.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="accountNumber">Numéro de compte</Label>
                                        <Input id="accountNumber" value={newAccountNumber} onChange={(e) => setNewAccountNumber(e.target.value)} />
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild><Button type="button" variant="ghost">Annuler</Button></DialogClose>
                                        <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Enregistrer</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

function FundsManagement({ user, onUpdate }: { user: UserProfile, onUpdate: (updatedUser: UserProfile) => void }) {
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [reason, setReason] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    
    const handleFundsAction = async (actionType: 'credit' | 'debit') => {
        if (!selectedAccountId || !amount || !reason) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Veuillez remplir tous les champs.' });
            return;
        }

        setIsSubmitting(true);
        const parsedAmount = parseFloat(amount);
        
        try {
            if (actionType === 'credit') {
                await addFundsToAccount(user.uid, selectedAccountId, parsedAmount, reason, adminDb);
                toast({ title: 'Dépôt réussi', description: `${parsedAmount}€ ont été ajoutés au compte.` });
            } else {
                await debitFundsFromAccount(user.uid, selectedAccountId, parsedAmount, reason, adminDb);
                toast({ title: 'Prélèvement réussi', description: `${parsedAmount}€ ont été déduits du compte.` });
            }

            const adjustment = actionType === 'credit' ? parsedAmount : -parsedAmount;
            const updatedAccounts = user.accounts.map(acc => 
                acc.id === selectedAccountId ? { ...acc, balance: acc.balance + adjustment } : acc
            );
            onUpdate({ ...user, accounts: updatedAccounts });

            setSelectedAccountId('');
            setAmount('');
            setReason('');
        } catch (error) {
            console.error(`Failed to ${actionType} funds:`, error);
            toast({ variant: 'destructive', title: 'Erreur', description: (error as Error).message });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card>
            <CardHeader><CardTitle>Gestion des fonds</CardTitle></CardHeader>
            <CardContent>
                 <Tabs defaultValue="credit">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="credit">Créditer</TabsTrigger>
                        <TabsTrigger value="debit">Débiter</TabsTrigger>
                    </TabsList>
                    <TabsContent value="credit">
                        <form onSubmit={(e) => { e.preventDefault(); handleFundsAction('credit'); }} className="w-full space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="credit-account">Compte à créditer</Label>
                                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                                    <SelectTrigger id="credit-account"><SelectValue placeholder="Sélectionner un compte" /></SelectTrigger>
                                    <SelectContent>{user.accounts.map(acc => (<SelectItem key={acc.id} value={acc.id}>{acc.name === 'checking' ? 'Compte Courant' : (acc.name === 'savings' ? 'Compte Épargne' : 'Carte de Crédit')}</SelectItem>))}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><Label htmlFor="credit-amount">Montant (€)</Label><Input id="credit-amount" type="number" placeholder="100.00" value={amount} onChange={e => setAmount(e.target.value)} /></div>
                            <div className="space-y-2"><Label htmlFor="credit-reason">Raison</Label><Input id="credit-reason" placeholder="Ex: Compensation commerciale" value={reason} onChange={e => setReason(e.target.value)} /></div>
                            <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créditer le compte</Button>
                        </form>
                    </TabsContent>
                    <TabsContent value="debit">
                         <form onSubmit={(e) => { e.preventDefault(); handleFundsAction('debit'); }} className="w-full space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="debit-account">Compte à débiter</Label>
                                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                                    <SelectTrigger id="debit-account"><SelectValue placeholder="Sélectionner un compte" /></SelectTrigger>
                                    <SelectContent>{user.accounts.map(acc => (<SelectItem key={acc.id} value={acc.id}>{acc.name === 'checking' ? 'Compte Courant' : (acc.name === 'savings' ? 'Compte Épargne' : 'Carte de Crédit')}</SelectItem>))}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><Label htmlFor="debit-amount">Montant (€)</Label><Input id="debit-amount" type="number" placeholder="50.00" value={amount} onChange={e => setAmount(e.target.value)} /></div>
                            <div className="space-y-2"><Label htmlFor="debit-reason">Raison</Label><Input id="debit-reason" placeholder="Ex: Frais de service" value={reason} onChange={e => setReason(e.target.value)} /></div>
                            <Button type="submit" variant="destructive" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Débiter le compte</Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}


function IbanManagement({ user, onUpdate }: { user: UserProfile, onUpdate: (updatedUser: UserProfile) => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleGenerateIban = async () => {
        setIsLoading(true);
        try {
            const { iban, bic } = await generateUserIban(user.uid, adminDb);
            toast({ title: 'RIB Généré', description: `Le RIB pour ${user.firstName} a été créé.` });
            onUpdate({ ...user, iban, bic });
        } catch (error) {
            console.error('Failed to generate IBAN:', error);
            toast({ variant: 'destructive', title: 'Erreur de génération', description: (error as Error).message });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>RIB / IBAN</CardTitle>
                <CardDescription>Gérer les informations bancaires de l'utilisateur.</CardDescription>
            </CardHeader>
            <CardContent>
                {user.iban ? (
                    <div className="space-y-4">
                        <div>
                            <Label>IBAN</Label>
                            <p className="font-mono text-lg p-2 bg-muted rounded-md">{user.iban}</p>
                        </div>
                         <div>
                            <Label>BIC</Label>
                            <p className="font-mono text-lg p-2 bg-muted rounded-md">{user.bic}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 space-y-4">
                        <p className="text-muted-foreground">Cet utilisateur n'a pas encore de RIB.</p>
                        <Button onClick={handleGenerateIban} disabled={isLoading}>
                             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Générer un RIB
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export function UserDetailClient({ userProfile }: UserDetailClientProps) {
    const router = useRouter();
    const [user, setUser] = useState(userProfile);

    const handleUpdate = (updatedUser: UserProfile) => {
        setUser(updatedUser);
    }
    
    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-4 shrink-0">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold font-headline">{user.firstName} {user.lastName}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pt-6 space-y-6">
                <Tabs defaultValue="accounts">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Aperçu</TabsTrigger>
                        <TabsTrigger value="accounts">Comptes & Solde</TabsTrigger>
                        <TabsTrigger value="iban">RIB</TabsTrigger>
                        <TabsTrigger value="cards">Cartes</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations personnelles</CardTitle>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-4">
                                <p><strong>Téléphone:</strong> {user.phone}</p>
                                <p><strong>Date de naissance:</strong> {new Date(user.dob).toLocaleDateString('fr-FR')}</p>
                                <p><strong>Pays de résidence:</strong> {user.residenceCountry}</p>
                                <p><strong>Adresse:</strong> {user.address}, {user.postalCode} {user.city}</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="accounts" className="space-y-6">
                        <AccountManagement user={user} onUpdate={handleUpdate} />
                        <FundsManagement user={user} onUpdate={handleUpdate} />
                    </TabsContent>
                    <TabsContent value="iban">
                        <IbanManagement user={user} onUpdate={handleUpdate} />
                    </TabsContent>
                    <TabsContent value="cards">
                        <Card>
                            <CardHeader><CardTitle>Gestion des cartes</CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">La gestion des cartes sera bientôt disponible ici.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
