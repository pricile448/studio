'use client';

import { useState } from 'react';
import { type UserProfile, type Account, addFundsToAccount, generateUserIban } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Banknote, Landmark, CreditCard, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { getFirebaseServices } from '@/lib/firebase/config';

const { db: adminDb } = getFirebaseServices('admin');

interface UserDetailClientProps {
    userProfile: UserProfile;
}

function AccountManagement({ user, onUpdate }: { user: UserProfile, onUpdate: (updatedUser: UserProfile) => void }) {
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [reason, setReason] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAccountId || !amount || !reason) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Veuillez remplir tous les champs.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const depositAmount = parseFloat(amount);
            await addFundsToAccount(user.uid, selectedAccountId, depositAmount, reason, adminDb);
            toast({ title: 'Dépôt réussi', description: `${depositAmount}€ ont été ajoutés au compte.` });
            
            // Optimistically update UI
            const updatedAccounts = user.accounts.map(acc => 
                acc.id === selectedAccountId ? { ...acc, balance: acc.balance + depositAmount } : acc
            );
            onUpdate({ ...user, accounts: updatedAccounts });

            // Reset form
            setSelectedAccountId('');
            setAmount('');
            setReason('');
        } catch (error) {
            console.error('Failed to make deposit:', error);
            toast({ variant: 'destructive', title: 'Erreur de dépôt', description: (error as Error).message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Comptes de l'utilisateur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {user.accounts.map(account => (
                    <div key={account.id} className="p-3 border rounded-md flex justify-between items-center">
                        <div>
                            <p className="font-medium">{account.name === 'checking' ? 'Compte Courant' : (account.name === 'savings' ? 'Compte Épargne' : 'Carte de Crédit')}</p>
                            <p className="text-sm text-muted-foreground">{account.accountNumber}</p>
                        </div>
                        <p className="text-lg font-bold">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(account.balance)}</p>
                    </div>
                ))}
            </CardContent>
            <CardFooter className="flex-col items-start gap-4 border-t pt-6">
                <h3 className="font-semibold">Effectuer un dépôt manuel</h3>
                <form onSubmit={handleDeposit} className="w-full space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="account">Compte à créditer</Label>
                            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                                <SelectTrigger id="account">
                                    <SelectValue placeholder="Sélectionner un compte" />
                                </SelectTrigger>
                                <SelectContent>
                                    {user.accounts.map(acc => (
                                        <SelectItem key={acc.id} value={acc.id}>
                                            {acc.name === 'checking' ? 'Compte Courant' : (acc.name === 'savings' ? 'Compte Épargne' : 'Carte de Crédit')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="amount">Montant (€)</Label>
                             <Input id="amount" type="number" placeholder="100.00" value={amount} onChange={e => setAmount(e.target.value)} />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="reason">Raison du dépôt</Label>
                        <Input id="reason" placeholder="Ex: Compensation commerciale" value={reason} onChange={e => setReason(e.target.value)} />
                    </div>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Créditer le compte
                    </Button>
                </form>
            </CardFooter>
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

            <div className="flex-1 min-h-0 overflow-y-auto pt-6">
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
                    <TabsContent value="accounts">
                        <AccountManagement user={user} onUpdate={handleUpdate} />
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
