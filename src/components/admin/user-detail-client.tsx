

'use client';

import { useState, useTransition, useEffect } from 'react';
import { type UserProfile, type Account, type Transaction, type Budget, addFundsToAccount, debitFundsFromAccount, updateUserAccountDetails, resetAccountBalance, deleteTransaction, deleteSelectedTransactions, deleteAllTransactions, deleteBudget, updateUserInFirestore, VirtualCard, PhysicalCardType, type PhysicalCard } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Banknote, Landmark, CreditCard, Loader2, MoreVertical, Edit, Ban, RefreshCw, Trash2, Eye, History, PieChart, FileText, Link as LinkIcon, AlertTriangle, PlusCircle, CheckCircle, Info, EyeOff, Smartphone, Receipt } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getFirebaseServices } from '@/lib/firebase/config';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Timestamp, serverTimestamp, deleteField } from 'firebase/firestore';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';


const { db: adminDb } = getFirebaseServices('admin');

interface UserDetailClientProps {
    userProfile: UserProfile;
}

const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  phone: z.string().min(1, 'Téléphone requis'),
  dob: z.coerce.date({ required_error: 'Date de naissance requise' }),
  pob: z.string().min(1, 'Lieu de naissance requis'),
  nationality: z.string().min(1, 'Nationalité requis'),
  residenceCountry: z.string().min(1, 'Pays de résidence requis'),
  address: z.string().min(1, 'Adresse requise'),
  city: z.string().min(1, 'Ville requise'),
  postalCode: z.string().min(1, 'Code postal requis'),
  profession: z.string().min(1, 'Profession requise'),
  salary: z.coerce.number().positive('Le salaire doit être positif'),
});
type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

function PersonalInformation({ user, onUpdate }: { user: UserProfile, onUpdate: (updatedUser: UserProfile) => void }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<PersonalInfoFormValues>({
        resolver: zodResolver(personalInfoSchema),
        defaultValues: {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phone || '',
            dob: user.dob ? new Date(user.dob) : new Date(),
            pob: user.pob || '',
            nationality: user.nationality || '',
            residenceCountry: user.residenceCountry || '',
            address: user.address || '',
            city: user.city || '',
            postalCode: user.postalCode || '',
            profession: user.profession || '',
            salary: user.salary || 0,
        }
    });

     useEffect(() => {
        form.reset({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phone || '',
            dob: user.dob ? new Date(user.dob) : new Date(),
            pob: user.pob || '',
            nationality: user.nationality || '',
            residenceCountry: user.residenceCountry || '',
            address: user.address || '',
            city: user.city || '',
            postalCode: user.postalCode || '',
            profession: user.profession || '',
            salary: user.salary ?? 0,
        });
    }, [user, form]);

    const handleSubmit = async (data: PersonalInfoFormValues) => {
        setIsSubmitting(true);
        try {
            await updateUserInFirestore(user.uid, data, adminDb);
            onUpdate({ ...user, ...data });
            toast({ title: "Succès", description: "Informations de l'utilisateur mises à jour." });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: (error as Error).message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Informations personnelles modifiables</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>Prénom</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Nom</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Téléphone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField
                                  control={form.control}
                                  name="dob"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Date de naissance</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="text"
                                          placeholder="YYYY-MM-DD"
                                          {...field}
                                          value={field.value instanceof Date ? format(field.value, 'yyyy-MM-dd') : field.value || ''}
                                          onChange={(e) => field.onChange(e.target.value)}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField control={form.control} name="pob" render={({ field }) => (<FormItem><FormLabel>Lieu de naissance</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="nationality" render={({ field }) => (<FormItem><FormLabel>Nationalité</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="residenceCountry" render={({ field }) => (<FormItem><FormLabel>Pays de résidence</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Adresse</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>Ville</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="postalCode" render={({ field }) => (<FormItem><FormLabel>Code postal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="profession" render={({ field }) => (<FormItem><FormLabel>Profession</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="salary" render={({ field }) => (<FormItem><FormLabel>Salaire</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Enregistrer les modifications</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Documents KYC</CardTitle></CardHeader>
                <CardContent>
                    {user.kycDocuments ? (
                        <ul className="space-y-2">
                            <li><Button variant="link" asChild><a href={user.kycDocuments.idDocumentUrl} target="_blank" rel="noopener noreferrer"><LinkIcon className="mr-2" />Voir la pièce d'identité</a></Button></li>
                            <li><Button variant="link" asChild><a href={user.kycDocuments.proofOfAddressUrl} target="_blank" rel="noopener noreferrer"><LinkIcon className="mr-2" />Voir le justificatif de domicile</a></Button></li>
                            <li><Button variant="link" asChild><a href={user.kycDocuments.selfieUrl} target="_blank" rel="noopener noreferrer"><LinkIcon className="mr-2" />Voir le selfie</a></Button></li>
                        </ul>
                    ) : (
                        <p className="text-muted-foreground">Aucun document KYC soumis par l'utilisateur.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

const ibanSchema = z.object({
  iban: z.string().min(1, 'IBAN est requis'),
  bic: z.string().min(1, 'BIC est requis'),
  billingText: z.string().optional(),
  billingHolder: z.string().optional(),
});
type IbanFormValues = z.infer<typeof ibanSchema>;

function IbanManagement({ user, onUpdate }: { user: UserProfile, onUpdate: (updatedUser: UserProfile) => void }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<IbanFormValues>({
        resolver: zodResolver(ibanSchema),
        defaultValues: { 
            iban: user.iban || '', 
            bic: user.bic || '',
            billingText: user.billingText || '',
            billingHolder: user.billingHolder || '',
        }
    });

    const handleSubmit = async (data: IbanFormValues) => {
        setIsSubmitting(true);
        try {
            await updateUserInFirestore(user.uid, data, adminDb);
            onUpdate({ ...user, ...data });
            toast({ title: "Succès", description: "RIB de l'utilisateur mis à jour." });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: (error as Error).message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gestion du RIB / IBAN</CardTitle>
                <CardDescription>Gérer les informations bancaires de l'utilisateur pour la facturation.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField control={form.control} name="billingHolder" render={({ field }) => (<FormItem><FormLabel>Nom du titulaire</FormLabel><FormControl><Input placeholder="Nom complet du titulaire du compte" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="iban" render={({ field }) => (<FormItem><FormLabel>IBAN</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="bic" render={({ field }) => (<FormItem><FormLabel>BIC</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="billingText" render={({ field }) => (<FormItem><FormLabel>Texte d'accompagnement</FormLabel><FormControl><Textarea placeholder="Instructions de paiement, référence client, etc." {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Enregistrer le RIB</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

const physicalCardEditSchema = z.object({
    number: z.string().min(16, "Doit comporter 16 chiffres").max(16, "Doit comporter 16 chiffres").regex(/^\d+$/, "Ne doit contenir que des chiffres"),
    expiry: z.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/, "Format MM/YY ou MM/AAAA"),
    cvv: z.string().min(3, "Doit comporter 3 chiffres").max(3, "Doit comporter 3 chiffres").regex(/^\d+$/, "Ne doit contenir que des chiffres"),
    pin: z.string().min(4, "Doit comporter 4 chiffres").max(4, "Doit comporter 4 chiffres").regex(/^\d+$/, "Ne doit contenir que des chiffres"),
});

function PhysicalCardManagement({ user, onUpdate }: { user: UserProfile, onUpdate: (updatedUser: UserProfile) => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isLimitDialogOpen, setIsLimitDialogOpen] = useState(false);
    const [isForceRequestOpen, setIsForceRequestOpen] = useState(false);
    const [newLimit, setNewLimit] = useState(user.cardLimits?.monthly || 2000);
    const [forceCardType, setForceCardType] = useState<PhysicalCardType>('essentielle');
    const [showAdminDetails, setShowAdminDetails] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof physicalCardEditSchema>>({
        resolver: zodResolver(physicalCardEditSchema),
        defaultValues: user.physicalCard ? {
            number: user.physicalCard.number || '',
            expiry: user.physicalCard.expiry || '',
            cvv: user.physicalCard.cvv || '',
            pin: user.physicalCard.pin || '',
        } : { number: '', expiry: '', cvv: '', pin: '' }
    });

     useEffect(() => {
        if (isEditOpen) {
            form.reset(user.physicalCard ? {
                number: user.physicalCard.number || '',
                expiry: user.physicalCard.expiry || '',
                cvv: user.physicalCard.cvv || '',
                pin: user.physicalCard.pin || '',
            } : {
                number: '',
                expiry: '',
                cvv: '',
                pin: ''
            });
        }
    }, [user.physicalCard, form, isEditOpen]);


    const handleAction = async (updateData: Partial<UserProfile>, successMessage: string) => {
        setIsLoading(true);
        try {
            await updateUserInFirestore(user.uid, updateData, adminDb);
            
            const updatedUser = { ...user };
            
            for (const key in updateData) {
                const typedKey = key as keyof UserProfile;
                const value = updateData[typedKey];
                
                if (typeof value === 'object' && value !== null && (value as any)._methodName === 'delete') {
                    delete (updatedUser as any)[typedKey];
                } else if (key === 'physicalCard' && updatedUser.physicalCard && typeof value === 'object' && value !== null) {
                    updatedUser.physicalCard = { ...updatedUser.physicalCard, ...(value as Partial<PhysicalCard>) };
                } else {
                    (updatedUser as any)[typedKey] = value;
                }
            }

            onUpdate(updatedUser);
            toast({ title: "Succès", description: successMessage });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: (error as Error).message });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleActivateCard = () => {
        if (!user.cardType) {
            toast({ variant: 'destructive', title: 'Erreur', description: "Type de carte non défini. Impossible d'activer." });
            return;
        }
        const newCard: PhysicalCard = {
            type: user.cardType,
            number: Array.from({ length: 4 }, () => String(Math.floor(1000 + Math.random() * 9000))).join(''),
            expiry: `0${Math.floor(Math.random() * 9) + 1}/${new Date().getFullYear() % 100 + 5}`,
            cvv: String(Math.floor(100 + Math.random() * 900)).padStart(3, '0'),
            pin: String(Math.floor(1000 + Math.random() * 9000)).padStart(4, '0'),
            isPinVisibleToUser: true,
            suspendedBy: null,
        };
        handleAction({ cardStatus: 'active', physicalCard: newCard }, "Carte activée et générée.");
    };

    const handleEditSubmit = async (data: z.infer<typeof physicalCardEditSchema>) => {
        await handleAction({ physicalCard: { ...user.physicalCard!, ...data } }, "Détails de la carte mis à jour.");
        setIsEditOpen(false);
    };

    const handleResetCard = () => {
        const newCard: PhysicalCard = {
            type: user.physicalCard!.type,
            isPinVisibleToUser: user.physicalCard!.isPinVisibleToUser,
            suspendedBy: null,
            number: Array.from({ length: 4 }, () => Math.floor(1000 + Math.random() * 9000).toString()).join(''),
            expiry: `0${Math.floor(Math.random() * 9) + 1}/${new Date().getFullYear() % 100 + 5}`,
            cvv: String(Math.floor(100 + Math.random() * 900)).padStart(3, '0'),
            pin: String(Math.floor(1000 + Math.random() * 9000)).padStart(4, '0'),
        };
        handleAction({ physicalCard: newCard }, "Carte physique réinitialisée.");
    };

    const handleCancelCard = () => {
        handleAction({ 
            cardStatus: 'none', 
            physicalCard: deleteField() as any,
            cardType: deleteField() as any,
            cardRequestedAt: deleteField() as any
        }, "Carte réinitialisée. L'utilisateur peut en commander une nouvelle.");
    }
    
    const handleTogglePinVisibility = (checked: boolean) => {
        handleAction({ physicalCard: { ...user.physicalCard!, isPinVisibleToUser: checked } }, "Visibilité du PIN pour l'utilisateur mise à jour.");
    };
    
    const handleSuspendCard = () => {
        handleAction({ cardStatus: 'suspended', physicalCard: { ...user.physicalCard!, suspendedBy: 'admin' } }, "Carte suspendue.");
    };

    const handleReactivateCard = () => {
        handleAction({ cardStatus: 'active', physicalCard: { ...user.physicalCard!, suspendedBy: null } }, "Carte réactivée.");
    };

    const handleLimitUpdate = () => {
        handleAction({ cardLimits: { ...user.cardLimits, monthly: newLimit } }, "Plafond de la carte mis à jour.");
        setIsLimitDialogOpen(false);
    };

    const handleForceRequest = () => {
        handleAction({ 
            cardStatus: 'requested', 
            cardType: forceCardType,
            cardRequestedAt: serverTimestamp() 
        }, "Demande de carte forcée.");
        setIsForceRequestOpen(false);
    }

    const cardStatusText = {
        none: 'Aucune carte',
        requested: 'Demandée',
        active: 'Active',
        suspended: 'Suspendue',
        cancelled: 'Annulée',
    };
    
    const cardTypeText = {
      essentielle: 'Essentielle',
      precieuse: 'Précieuse',
      luminax: 'Luminax'
    }

    const getStatusVariant = (status: UserProfile['cardStatus']) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'requested': return 'bg-blue-100 text-blue-800';
            case 'suspended': return 'bg-orange-100 text-orange-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gestion de la Carte Physique</CardTitle>
                <CardDescription>Gérer la carte bancaire physique de l'utilisateur.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg flex-wrap gap-4">
                     <div>
                        <p className="text-sm text-muted-foreground">Statut de la carte</p>
                        <Badge variant="outline" className={cn("text-base", getStatusVariant(user.cardStatus))}>
                            {cardStatusText[user.cardStatus]}
                        </Badge>
                    </div>
                    {user.cardType && (
                        <div>
                            <p className="text-sm text-muted-foreground">Type de carte</p>
                            <p className="font-semibold">{cardTypeText[user.cardType]}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-sm text-muted-foreground">Plafond mensuel</p>
                        <p className="font-semibold">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(user.cardLimits?.monthly || 0)}</p>
                    </div>
                </div>

                {user.cardStatus === 'active' || user.cardStatus === 'suspended' ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium">Détails de la carte</h3>
                            <Button variant="ghost" size="sm" onClick={() => setShowAdminDetails(!showAdminDetails)}>
                                {showAdminDetails ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                                {showAdminDetails ? 'Masquer' : 'Afficher'}
                            </Button>
                        </div>
                        {user.physicalCard && (
                          <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                              <div><p className="text-sm text-muted-foreground">Numéro</p><p className="font-mono">{showAdminDetails ? user.physicalCard.number.replace(/(\d{4})/g, '$1 ').trim() : '**** **** **** ****'}</p></div>
                              <div><p className="text-sm text-muted-foreground">Expiration</p><p className="font-mono">{showAdminDetails ? user.physicalCard.expiry : 'MM/YY'}</p></div>
                              <div><p className="text-sm text-muted-foreground">CVV</p><p className="font-mono">{showAdminDetails ? user.physicalCard.cvv : '***'}</p></div>
                              <div><p className="text-sm text-muted-foreground">PIN</p><p className="font-mono">{showAdminDetails ? user.physicalCard.pin : '****'}</p></div>
                          </div>
                        )}

                        {user.physicalCard && (
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="pin-visibility">Autoriser l'utilisateur à voir le code PIN</Label>
                                    <p className="text-xs text-muted-foreground">Permet à l'utilisateur de voir son PIN dans son application.</p>
                                </div>
                                <Switch id="pin-visibility" checked={user.physicalCard.isPinVisibleToUser} onCheckedChange={handleTogglePinVisibility} disabled={isLoading} />
                            </div>
                        )}
                    </div>
                ): null}
                
                <div className="flex flex-wrap gap-2">
                    {user.kycStatus !== 'verified' ? (
                        <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Action requise</AlertTitle><AlertDescription>L'utilisateur doit avoir un statut KYC "Vérifié" pour gérer les cartes.</AlertDescription></Alert>
                    ) : user.cardStatus === 'none' ? (
                        <Dialog open={isForceRequestOpen} onOpenChange={setIsForceRequestOpen}>
                          <DialogTrigger asChild><Button disabled={isLoading}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Forcer la demande</Button></DialogTrigger>
                          <DialogContent><DialogHeader><DialogTitle>Forcer une demande de carte</DialogTitle></DialogHeader><div className="py-4 space-y-2"><Label htmlFor="card-type-select">Type de carte</Label><Select value={forceCardType} onValueChange={(v) => setForceCardType(v as PhysicalCardType)}><SelectTrigger id="card-type-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="essentielle">Essentielle</SelectItem><SelectItem value="precieuse">Précieuse</SelectItem><SelectItem value="luminax">Luminax</SelectItem></SelectContent></Select></div><DialogFooter><DialogClose asChild><Button variant="ghost">Annuler</Button></DialogClose><Button onClick={handleForceRequest}>Confirmer</Button></DialogFooter></DialogContent>
                        </Dialog>
                    ) : user.cardStatus === 'requested' ? (
                        <>
                            <Button onClick={handleActivateCard} disabled={isLoading}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Activer la carte</Button>
                            <Button variant="destructive" onClick={() => handleAction({ cardStatus: 'none', cardRequestedAt: deleteField() as any, cardType: deleteField() as any }, "Demande de carte annulée.")} disabled={isLoading}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Annuler la demande</Button>
                        </>
                    ) : user.cardStatus === 'active' ? (
                        <Button variant="destructive" onClick={handleSuspendCard} disabled={isLoading}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Suspendre la carte</Button>
                    ) : user.cardStatus === 'suspended' ? (
                         <Button variant="success" onClick={handleReactivateCard} disabled={isLoading}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Réactiver la carte</Button>
                    ) : null}

                    {(user.cardStatus === 'active' || user.cardStatus === 'suspended') && (
                       <>
                         <Dialog open={isLimitDialogOpen} onOpenChange={setIsLimitDialogOpen}><DialogTrigger asChild><Button variant="outline">Modifier le plafond</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Modifier le plafond</DialogTitle></DialogHeader><div className="py-4"><Label htmlFor="new-limit">Nouveau plafond mensuel</Label><Input id="new-limit" type="number" value={newLimit} onChange={(e) => setNewLimit(Number(e.target.value))} /></div><DialogFooter><Button variant="ghost" onClick={() => setIsLimitDialogOpen(false)}>Annuler</Button><Button onClick={handleLimitUpdate}>Enregistrer</Button></DialogFooter></DialogContent></Dialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setIsEditOpen(true); }}><Edit className="mr-2 h-4 w-4" /> Modifier les détails</DropdownMenuItem>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()}><RefreshCw className="mr-2 h-4 w-4" /> Réinitialiser la carte</DropdownMenuItem></AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Réinitialiser la carte ?</AlertDialogTitle><AlertDialogDescription>Une nouvelle série d'informations (numéro, CVV, PIN) sera générée. Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleResetCard}>Confirmer</AlertDialogAction></AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    <DropdownMenuSeparator />
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild><DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}><Trash2 className="mr-2 h-4 w-4" /> Annuler la carte</DropdownMenuItem></AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Annuler la carte définitivement ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible et réinitialisera le statut de la carte de l'utilisateur, lui permettant d'en commander une nouvelle.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction className="bg-destructive" onClick={handleCancelCard}>Confirmer l'annulation</AlertDialogAction></AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </DropdownMenuContent>
                            </DropdownMenu>
                       </>
                    )}
                </div>
                
                 <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent>
                         <DialogHeader><DialogTitle>Modifier la carte physique</DialogTitle></DialogHeader>
                         <Form {...form}>
                             <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4 pt-4">
                                <FormField control={form.control} name="number" render={({ field }) => (<FormItem><FormLabel>Numéro de carte</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <div className="grid grid-cols-2 gap-4">
                                     <FormField control={form.control} name="expiry" render={({ field }) => (<FormItem><FormLabel>Expiration (MM/YY)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name="cvv" render={({ field }) => (<FormItem><FormLabel>CVV</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                 <FormField control={form.control} name="pin" render={({ field }) => (<FormItem><FormLabel>PIN</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                 <DialogFooter>
                                     <DialogClose asChild><Button variant="ghost" type="button">Annuler</Button></DialogClose>
                                     <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Enregistrer</Button>
                                 </DialogFooter>
                             </form>
                         </Form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}

const virtualCardEditSchema = z.object({
    name: z.string().min(3, "Le nom doit comporter au moins 3 caractères."),
    number: z.string().min(16, "Doit comporter 16 chiffres").max(19, "Doit comporter au maximum 19 chiffres").regex(/^[\d\s]+$/, "Ne doit contenir que des chiffres et des espaces"),
    expiry: z.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/, "Format MM/AA ou MM/AAAA"),
    cvv: z.string().min(3, "Doit comporter 3 chiffres").max(4, "Doit comporter au maximum 4 chiffres").regex(/^\d+$/, "Ne doit contenir que des chiffres"),
    limit: z.coerce.number().positive("Le plafond doit être un nombre positif."),
});

function VirtualCardManagement({ user, onUpdate }: { user: UserProfile, onUpdate: (updatedUser: UserProfile) => void }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [shownDetails, setShownDetails] = useState<string[]>([]);
    const [editingCard, setEditingCard] = useState<VirtualCard | null>(null);

    const form = useForm<z.infer<typeof virtualCardEditSchema>>({
        resolver: zodResolver(virtualCardEditSchema),
    });
    
    useEffect(() => {
        if (editingCard) {
            form.reset({
                name: editingCard.name,
                number: editingCard.number,
                expiry: editingCard.expiry,
                cvv: editingCard.cvv,
                limit: editingCard.limit,
            });
        }
    }, [editingCard, form]);

    const handleAction = async (action: () => Promise<any>, successMsg: string, errorMsg: string) => {
        setIsLoading(true);
        try {
            await action();
            toast({ title: 'Succès', description: successMsg });
        } catch (error) {
            console.error(errorMsg, error);
            toast({ variant: 'destructive', title: 'Erreur', description: (error as Error).message || errorMsg });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateVirtualCard = async () => {
        await handleAction(
            async () => {
                const newCard: VirtualCard = {
                    id: `vc_${Date.now()}`,
                    type: 'virtual',
                    name: 'Carte virtuelle',
                    number: '4000 1234 5678 ' + Math.floor(1000 + Math.random() * 9000),
                    expiry: `0${Math.floor(Math.random() * 9) + 1}/${new Date().getFullYear() % 100 + 5}`,
                    cvv: String(Math.floor(100 + Math.random() * 900)).padStart(3, '0'),
                    limit: 1000,
                    isFrozen: false,
                    frozenBy: null,
                    isDetailsVisibleToUser: true,
                    createdAt: Timestamp.now(),
                };
                
                const updatedVirtualCards = [...(user.virtualCards || []), newCard];
                await updateUserInFirestore(user.uid, { 
                    virtualCards: updatedVirtualCards,
                    hasPendingVirtualCardRequest: deleteField(),
                    virtualCardRequestedAt: deleteField()
                 }, adminDb);

                onUpdate({ ...user, virtualCards: updatedVirtualCards, hasPendingVirtualCardRequest: false, virtualCardRequestedAt: undefined });
            },
            "Nouvelle carte virtuelle générée pour l'utilisateur.",
            "Erreur lors de la génération de la carte."
        );
    };
    
    const handleEditSubmit = async (data: z.infer<typeof virtualCardEditSchema>) => {
        if (!editingCard) return;

        const cardIndex = user.virtualCards.findIndex(c => c.id === editingCard.id);
        if (cardIndex === -1) return;

        const updatedCards = [...user.virtualCards];
        const cardToUpdate = { ...updatedCards[cardIndex] };
        
        cardToUpdate.name = data.name;
        cardToUpdate.number = data.number;
        cardToUpdate.expiry = data.expiry;
        cardToUpdate.cvv = data.cvv;
        cardToUpdate.limit = data.limit;
        
        updatedCards[cardIndex] = cardToUpdate;
        
        await handleAction(
            async () => {
                await updateUserInFirestore(user.uid, { virtualCards: updatedCards }, adminDb);
                onUpdate({ ...user, virtualCards: updatedCards });
            },
            "Carte virtuelle mise à jour.",
            "Erreur lors de la mise à jour."
        );
        setEditingCard(null);
    };
    
    const handleToggleDetailsVisibility = async (cardId: string, checked: boolean) => {
        const cardIndex = user.virtualCards.findIndex(c => c.id === cardId);
        if (cardIndex === -1) return;

        const updatedCards = [...user.virtualCards];
        updatedCards[cardIndex].isDetailsVisibleToUser = checked;
        
        await handleAction(
            async () => {
                await updateUserInFirestore(user.uid, { virtualCards: updatedCards }, adminDb);
                onUpdate({ ...user, virtualCards: updatedCards });
            },
            `Visibilité des détails de la carte mise à jour.`,
            'Erreur lors du changement de visibilité.'
        );
    };

    const handleToggleFreeze = async (cardId: string) => {
        const cardIndex = user.virtualCards.findIndex(c => c.id === cardId);
        if (cardIndex === -1) return;

        const updatedCards = [...user.virtualCards];
        const newStatus = !updatedCards[cardIndex].isFrozen;
        updatedCards[cardIndex].isFrozen = newStatus;
        updatedCards[cardIndex].frozenBy = newStatus ? 'admin' : null;

        await handleAction(
            async () => {
                await updateUserInFirestore(user.uid, { virtualCards: updatedCards }, adminDb);
                onUpdate({ ...user, virtualCards: updatedCards });
            },
            `Carte ${newStatus ? 'suspendue' : 'réactivée'}.`,
            'Erreur lors du changement de statut de la carte.'
        );
    };

    const handleDeleteCard = async (cardId: string) => {
        const updatedCards = user.virtualCards.filter(c => c.id !== cardId);

        await handleAction(
            async () => {
                await updateUserInFirestore(user.uid, { virtualCards: updatedCards }, adminDb);
                onUpdate({ ...user, virtualCards: updatedCards });
            },
            `Carte virtuelle supprimée.`,
            'Erreur lors de la suppression de la carte.'
        );
    };
    
    const toggleShowDetails = (cardId: string) => {
        setShownDetails(prev => 
            prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gestion des cartes virtuelles</CardTitle>
                <CardDescription>Gérer les cartes virtuelles de paiement de l'utilisateur.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {user.hasPendingVirtualCardRequest && (
                    <Alert variant="info">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Demande en attente</AlertTitle>
                        <AlertDescription className="flex items-center justify-between">
                            <span>L'utilisateur a demandé une nouvelle carte virtuelle le {user.virtualCardRequestedAt ? format(user.virtualCardRequestedAt, 'dd/MM/yyyy') : ''}.</span>
                            <Button onClick={handleGenerateVirtualCard} disabled={isLoading || user.kycStatus !== 'verified'}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Smartphone className="mr-2 h-4 w-4" />}
                                Générer
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}
                
                {user.kycStatus !== 'verified' && !user.hasPendingVirtualCardRequest && (
                    <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Action requise</AlertTitle><AlertDescription>L'utilisateur doit avoir un statut KYC "Vérifié" pour gérer les cartes.</AlertDescription></Alert>
                )}
                
                <div className="space-y-4">
                    {(user.virtualCards || []).map(card => (
                         <div key={card.id} className="p-4 border rounded-lg space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold">{card.name} (.... {card.number.slice(-4)})</p>
                                    <Badge variant={card.isFrozen ? "destructive" : "outline"} className={!card.isFrozen ? "border-green-300 text-green-700 bg-green-50" : ""}>
                                      {card.isFrozen ? 'Suspendue' : 'Active'}
                                    </Badge>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical /></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setEditingCard(card);}}><Edit className="mr-2 h-4 w-4" /> Modifier</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => handleToggleFreeze(card.id)}>
                                            {card.isFrozen ? <RefreshCw className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />}
                                            {card.isFrozen ? 'Réactiver' : 'Suspendre'}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild><DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}><Trash2 className="mr-2 h-4 w-4" /> Supprimer</DropdownMenuItem></AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Supprimer la carte ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteCard(card.id)}>Confirmer</AlertDialogAction></AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium text-sm">Détails de la carte</h3>
                                    <Button variant="ghost" size="sm" onClick={() => toggleShowDetails(card.id)}>
                                        {shownDetails.includes(card.id) ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                                        {shownDetails.includes(card.id) ? 'Masquer' : 'Afficher'}
                                    </Button>
                                </div>
                                {shownDetails.includes(card.id) && (
                                    <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg mt-2 text-sm">
                                        <div><p className="text-xs text-muted-foreground">Numéro</p><p className="font-mono">{card.number}</p></div>
                                        <div><p className="text-xs text-muted-foreground">Expiration</p><p className="font-mono">{card.expiry}</p></div>
                                        <div><p className="text-xs text-muted-foreground">CVV</p><p className="font-mono">{card.cvv}</p></div>
                                        <div><p className="text-xs text-muted-foreground">Plafond</p><p className="font-mono">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(card.limit)}</p></div>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor={`details-visibility-${card.id}`}>Autoriser l'utilisateur à voir les détails</Label>
                                    <p className="text-xs text-muted-foreground">Permet à l'utilisateur de voir le numéro complet et le CVV.</p>
                                </div>
                                <Switch id={`details-visibility-${card.id}`} checked={card.isDetailsVisibleToUser} onCheckedChange={(checked) => handleToggleDetailsVisibility(card.id, checked)} disabled={isLoading} />
                            </div>
                         </div>
                    ))}
                    {(!user.virtualCards || user.virtualCards.length === 0) && !user.hasPendingVirtualCardRequest && user.kycStatus === 'verified' && (
                        <p className="text-muted-foreground text-center py-4">Cet utilisateur n'a aucune carte virtuelle.</p>
                    )}
                </div>

                <Dialog open={!!editingCard} onOpenChange={(open) => !open && setEditingCard(null)}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Modifier la carte virtuelle</DialogTitle></DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4 pt-4">
                                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nom de la carte</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="number" render={({ field }) => (<FormItem><FormLabel>Numéro de carte</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="expiry" render={({ field }) => (<FormItem><FormLabel>Expiration (MM/AA)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="cvv" render={({ field }) => (<FormItem><FormLabel>CVV</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <FormField control={form.control} name="limit" render={({ field }) => (<FormItem><FormLabel>Plafond</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <DialogFooter>
                                    <DialogClose asChild><Button variant="ghost" type="button">Annuler</Button></DialogClose>
                                    <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Enregistrer</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
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
            // The onUpdate will be called in the specific handlers to pass the correct updated state
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
                                    <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setSelectedAccount(account); setNewAccountNumber(account.accountNumber); setIsEditOpen(true);}}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>Modifier</span>
                                    </DropdownMenuItem>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className={cn(
                                                "focus:cursor-pointer",
                                                account.status === 'active' 
                                                    ? "text-destructive focus:text-destructive" 
                                                    : "text-green-600 focus:text-green-700"
                                            )}>
                                                {account.status === 'active' ? <Ban className="mr-2 h-4 w-4" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                                <span>{account.status === 'active' ? 'Suspendre' : 'Réactiver'}</span>
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Confirmer l'action</AlertDialogTitle></AlertDialogHeader>
                                            <AlertDialogDescription>Êtes-vous sûr de vouloir {account.status === 'active' ? 'suspendre' : 'réactiver'} ce compte ?</AlertDialogDescription>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                <AlertDialogAction 
                                                    onClick={() => handleToggleStatus(account)}
                                                    variant={account.status === 'active' ? 'destructive' : 'success'}
                                                >
                                                    Confirmer
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()}><Trash2 className="mr-2 h-4 w-4" /><span>Remettre à zéro</span></DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Confirmer la remise à zéro</AlertDialogTitle></AlertDialogHeader>
                                            <AlertDialogDescription>Cette action est irréversible et mettra le solde du compte à 0.</AlertDialogDescription>
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

function TransactionsManagement({ user, onUpdate }: { user: UserProfile, onUpdate: (updatedUser: UserProfile) => void }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    
    const transactions = [...user.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const isAllSelected = transactions.length > 0 && selectedIds.length === transactions.length;

    const handleSelect = (id: string, checked: boolean) => {
        setSelectedIds(prev => checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id));
    };
    
    const handleSelectAll = (checked: boolean) => {
        setSelectedIds(checked ? transactions.map(tx => tx.id) : []);
    };
    
    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        setIsLoading(true);
        try {
            await deleteSelectedTransactions(user.uid, selectedIds, adminDb);
            
            // Recalculate state locally
            const transactionsToDelete = user.transactions.filter(tx => selectedIds.includes(tx.id));
            let updatedAccounts = JSON.parse(JSON.stringify(user.accounts));

            for (const tx of transactionsToDelete) {
                const accountIndex = updatedAccounts.findIndex((acc: Account) => acc.id === tx.accountId);
                if (accountIndex !== -1) {
                    updatedAccounts[accountIndex].balance -= tx.amount;
                }
            }
            const updatedTransactions = user.transactions.filter(tx => !selectedIds.includes(tx.id));
            
            onUpdate({ ...user, transactions: updatedTransactions, accounts: updatedAccounts });
            toast({ title: 'Succès', description: `${selectedIds.length} transaction(s) supprimée(s).` });
            setSelectedIds([]);
        } catch (error) {
            console.error('Erreur lors de la suppression des transactions.', error);
            toast({ variant: 'destructive', title: 'Erreur', description: (error as Error).message || 'Erreur lors de la suppression des transactions.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDeleteAll = async () => {
        setIsLoading(true);
        try {
            await deleteAllTransactions(user.uid, adminDb);
            const updatedAccounts = user.accounts.map(acc => ({...acc, balance: 0}));
            onUpdate({ ...user, transactions: [], accounts: updatedAccounts });
            toast({ title: 'Succès', description: 'Toutes les transactions ont été supprimées.' });
            setSelectedIds([]);
        } catch (error) {
            console.error('Erreur lors de la suppression de toutes les transactions.', error);
            toast({ variant: 'destructive', title: 'Erreur', description: (error as Error).message || 'Erreur lors de la suppression de toutes les transactions.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Historique des transactions</CardTitle>
                <CardDescription>Gérer toutes les transactions de l'utilisateur.</CardDescription>
                <div className="flex flex-wrap gap-2 pt-4">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={selectedIds.length === 0 || isLoading}>Supprimer la sélection ({selectedIds.length})</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Cette action est irréversible. Elle supprimera les {selectedIds.length} transactions sélectionnées et ajustera les soldes des comptes associés.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteSelected} disabled={isLoading}>
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : "Confirmer"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={transactions.length === 0 || isLoading}>Supprimer tout</Button>
                        </AlertDialogTrigger>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirmer la suppression totale</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Cette action est irréversible. Elle supprimera TOUTES les transactions et réinitialisera les soldes de TOUS les comptes à zéro.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteAll} disabled={isLoading}>
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : "Tout supprimer"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox checked={isAllSelected} onCheckedChange={(checked) => handleSelectAll(!!checked)} aria-label="Tout sélectionner" />
                            </TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Montant</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map(tx => (
                            <TableRow key={tx.id} data-state={selectedIds.includes(tx.id) && "selected"}>
                                <TableCell>
                                    <Checkbox checked={selectedIds.includes(tx.id)} onCheckedChange={(checked) => handleSelect(tx.id, !!checked)} aria-label="Sélectionner la transaction"/>
                                </TableCell>
                                <TableCell>{format(new Date(tx.date), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                                <TableCell>{tx.description}</TableCell>
                                <TableCell className={cn('font-medium', tx.amount > 0 ? 'text-green-600' : 'text-red-600')}>
                                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(tx.amount)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 {transactions.length === 0 && <p className="text-center text-muted-foreground p-4">Aucune transaction.</p>}
            </CardContent>
        </Card>
    );
}


function BudgetsManagement({ user, onUpdate }: { user: UserProfile, onUpdate: (updatedUser: UserProfile) => void }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);

    const handleDelete = async () => {
        if (!budgetToDelete) return;
        setIsLoading(true);
        try {
            await deleteBudget(user.uid, budgetToDelete.id, adminDb);
            const updatedBudgets = user.budgets.filter(b => b.id !== budgetToDelete.id);
            onUpdate({ ...user, budgets: updatedBudgets });
            toast({ title: 'Succès', description: 'Budget supprimé.' });
        } catch (error) {
            console.error('Erreur lors de la suppression du budget.', error);
            toast({ variant: 'destructive', title: 'Erreur', description: (error as Error).message || 'Erreur lors de la suppression du budget.' });
        } finally {
            setIsLoading(false);
            setBudgetToDelete(null);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Budgets de l'utilisateur</CardTitle>
                <CardDescription>Gérer les budgets créés par l'utilisateur.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {user.budgets.map(budget => (
                    <div key={budget.id} className="p-4 border rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{budget.name}</p>
                            <p className="text-sm text-muted-foreground">Catégorie: {budget.category}</p>
                            <p className="text-lg font-bold">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(budget.total)}</p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" onClick={() => setBudgetToDelete(budget)}>Supprimer</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                    <AlertDialogDescription>Êtes-vous sûr de vouloir supprimer ce budget ? Cette action est irréversible.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setBudgetToDelete(null)}>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
                                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : "Confirmer"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                ))}
                {user.budgets.length === 0 && <p className="text-center text-muted-foreground p-4">Aucun budget défini.</p>}
            </CardContent>
        </Card>
    );
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
                <Tabs defaultValue="overview">
                    <TabsList className="h-auto flex-wrap gap-1">
                        <TabsTrigger value="overview">Aperçu</TabsTrigger>
                        <TabsTrigger value="accounts">Comptes</TabsTrigger>
                        <TabsTrigger value="transactions">Transactions</TabsTrigger>
                        <TabsTrigger value="budgets">Budgets</TabsTrigger>
                        <TabsTrigger value="iban">RIB</TabsTrigger>
                        <TabsTrigger value="cards">Cartes</TabsTrigger>
                        <TabsTrigger value="billing">Facturation</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview">
                        <PersonalInformation user={user} onUpdate={handleUpdate} />
                    </TabsContent>
                    <TabsContent value="accounts" className="space-y-6">
                        <AccountManagement user={user} onUpdate={handleUpdate} />
                        <FundsManagement user={user} onUpdate={handleUpdate} />
                    </TabsContent>
                     <TabsContent value="transactions">
                        <TransactionsManagement user={user} onUpdate={handleUpdate} />
                    </TabsContent>
                    <TabsContent value="budgets">
                        <BudgetsManagement user={user} onUpdate={handleUpdate} />
                    </TabsContent>
                    <TabsContent value="iban">
                        <IbanManagement user={user} onUpdate={handleUpdate} />
                    </TabsContent>
                    <TabsContent value="cards" className="space-y-6">
                        <PhysicalCardManagement user={user} onUpdate={handleUpdate} />
                        <VirtualCardManagement user={user} onUpdate={handleUpdate} />
                    </TabsContent>
                    <TabsContent value="billing">
                        <IbanManagement user={user} onUpdate={handleUpdate} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
