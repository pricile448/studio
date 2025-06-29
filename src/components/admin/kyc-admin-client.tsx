'use client';

import { useEffect, useState } from 'react';
import { getPendingKycUsers, updateUserInFirestore, type UserProfile } from '@/lib/firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function KycAdminClient() {
    const [requests, setRequests] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const requestList = await getPendingKycUsers();
            setRequests(requestList);
        } catch (error) {
            console.error("Erreur lors de la récupération des demandes KYC:", error);
            useToast().toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les demandes KYC.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleKycAction = async (userId: string, status: 'verified' | 'unverified') => {
        setUpdatingId(userId);
        try {
            await updateUserInFirestore(userId, { kycStatus: status });
            useToast().toast({ title: 'Statut KYC mis à jour', description: `L'utilisateur a été ${status === 'verified' ? 'approuvé' : 'rejeté'}.` });
            // Refresh list
            fetchRequests();
        } catch (error) {
            console.error("Erreur lors de la mise à jour du statut KYC:", error);
            useToast().toast({ variant: 'destructive', title: 'Erreur', description: 'La mise à jour du statut a échoué.' });
        } finally {
            setUpdatingId(null);
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    if (requests.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                    <p>Aucune demande de vérification en attente.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Demandes en attente</CardTitle>
                <CardDescription>
                    Examinez les demandes de vérification d'identité en attente.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Date de soumission</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map(user => (
                            <TableRow key={user.uid}>
                                <TableCell>{user.firstName} {user.lastName}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    {user.kycSubmittedAt ? format(new Date(user.kycSubmittedAt), 'dd MMMM yyyy', { locale: fr }) : 'N/A'}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                     {updatingId === user.uid ? (
                                        <Button variant="outline" size="sm" disabled>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        </Button>
                                     ) : (
                                        <>
                                            <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-100" onClick={() => handleKycAction(user.uid, 'verified')}>
                                                <CheckCircle className="h-5 w-5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-100" onClick={() => handleKycAction(user.uid, 'unverified')}>
                                                <XCircle className="h-5 w-5" />
                                            </Button>
                                        </>
                                     )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
