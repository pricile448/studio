'use client';

import { useEffect, useState, useTransition } from 'react';
import { getAllTransfers, updateTransferStatus, executeTransfer, type Transaction } from '@/lib/firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Loader2, Hourglass, RefreshCw } from 'lucide-react';
import { getFirebaseServices } from '@/lib/firebase/config';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const { db: adminDb } = getFirebaseServices('admin');

type TransferWithUser = Transaction & { userId: string; userName: string };

function TransfersTable({ transfers, onAction, actionInProgressId }: { transfers: TransferWithUser[], onAction: (action: 'validate' | 'execute' | 'cancel', transfer: TransferWithUser) => void, actionInProgressId: string | null }) {
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    const actionButtons = (transfer: TransferWithUser) => {
        const isLoading = actionInProgressId === transfer.id;

        if (transfer.status === 'pending') {
            return (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button variant="outline" size="sm" disabled={isLoading}>{isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : null} Valider</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Valider ce virement ?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Le virement passera au statut "En cours" et pourra être exécuté ou interrompu. Le solde du client ne sera pas encore débité.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onAction('validate', transfer)}>Valider</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            );
        }
        if (transfer.status === 'in_progress') {
            return (
                <div className="space-x-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>{isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : null} Exécuter</Button>
                        </AlertDialogTrigger>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Exécuter ce virement ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Cette action est irréversible. Le solde du compte de l'utilisateur sera débité et le virement marqué comme complété.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onAction('execute', transfer)} className="bg-green-600 hover:bg-green-700">Confirmer l'exécution</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <Button variant="destructive" size="sm" disabled={isLoading}>{isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : null} Interrompre</Button>
                        </AlertDialogTrigger>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Interrompre ce virement ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                   Cette action est irréversible. Le virement sera marqué comme échoué et ne pourra plus être exécuté.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onAction('cancel', transfer)} variant="destructive">Confirmer l'interruption</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )
        }
        return null;
    }

    if (transfers.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-12">
                <p>Aucun virement dans cette catégorie.</p>
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Bénéficiaire</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Date de demande</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {transfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                        <TableCell>
                            <div className="font-medium">{transfer.userName}</div>
                            <div className="text-sm text-muted-foreground">{transfer.userId}</div>
                        </TableCell>
                        <TableCell>
                             <div className="font-medium">{transfer.beneficiaryName}</div>
                             <div className="text-sm text-muted-foreground">{transfer.description}</div>
                        </TableCell>
                        <TableCell className="font-semibold">{formatCurrency(transfer.amount)}</TableCell>
                        <TableCell>{format(new Date(transfer.date), 'dd MMMM yyyy, HH:mm', { locale: fr })}</TableCell>
                        <TableCell className="text-right">{actionButtons(transfer)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export function TransfersAdminClient() {
    const [allTransfers, setAllTransfers] = useState<TransferWithUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
    const [isRefreshing, startRefreshTransition] = useTransition();
    const { toast } = useToast();

    const fetchTransfers = async () => {
        setLoading(true);
        try {
            const transfersList = await getAllTransfers(adminDb);
            setAllTransfers(transfersList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (error) {
            console.error("Erreur lors de la récupération des virements:", error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les virements.' });
        } finally {
            setLoading(false);
        }
    };
    
    const handleRefresh = () => {
        startRefreshTransition(async () => {
            await fetchTransfers();
            toast({ title: 'Liste des virements actualisée.' });
        })
    }

    useEffect(() => {
        fetchTransfers();
    }, []);

    const handleAction = async (action: 'validate' | 'execute' | 'cancel', transfer: TransferWithUser) => {
        setActionInProgressId(transfer.id);
        try {
            if (action === 'validate') {
                await updateTransferStatus(transfer.userId, transfer.id, 'in_progress', adminDb);
                toast({ title: 'Succès', description: 'Le virement a été validé et est prêt à être exécuté.' });
            } else if (action === 'execute') {
                await executeTransfer(transfer.userId, transfer.id, adminDb);
                toast({ title: 'Succès', description: 'Le virement a été exécuté et le solde du client a été mis à jour.' });
            } else if (action === 'cancel') {
                await updateTransferStatus(transfer.userId, transfer.id, 'failed', adminDb);
                toast({ variant: 'destructive', title: 'Action effectuée', description: 'Le virement a été interrompu.' });
            }
            fetchTransfers();
        } catch (error) {
             toast({ variant: 'destructive', title: 'Erreur', description: (error as Error).message });
        } finally {
            setActionInProgressId(null);
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
                <CardContent><div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div></CardContent>
            </Card>
        );
    }
    
    const pendingTransfers = allTransfers.filter(t => t.status === 'pending');
    const inProgressTransfers = allTransfers.filter(t => t.status === 'in_progress');

    return (
       <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Validation des Virements</CardTitle>
                        <CardDescription>Gérez les virements externes initiés par les utilisateurs.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                        <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
                        Actualiser
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                 <Tabs defaultValue="pending">
                    <TabsList>
                        <TabsTrigger value="pending">
                            <Hourglass className="mr-2 h-4 w-4" />
                            En attente
                            <Badge className="ml-2">{pendingTransfers.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="in_progress">
                             <CheckCircle className="mr-2 h-4 w-4 text-green-600"/>
                            En cours
                             <Badge className="ml-2">{inProgressTransfers.length}</Badge>
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="pending" className="pt-4">
                        <TransfersTable transfers={pendingTransfers} onAction={handleAction} actionInProgressId={actionInProgressId} />
                    </TabsContent>
                    <TabsContent value="in_progress" className="pt-4">
                        <TransfersTable transfers={inProgressTransfers} onAction={handleAction} actionInProgressId={actionInProgressId} />
                    </TabsContent>
                </Tabs>
            </CardContent>
       </Card>
    );
}
