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
import { getFirebaseServices } from '@/lib/firebase/config';
import Link from 'next/link';
import { deleteDoc, doc } from 'firebase/firestore';


const { db: adminDb } = getFirebaseServices('admin');

// Change: This now represents a KYC submission, not a full UserProfile.
type KycRequest = {
    uid: string;
    firstName: string;
    lastName: string;
    email: string;
    kycSubmittedAt: Date;
    kycStatus: 'pending';
}

export function KycAdminClient() {
    const [requests, setRequests] = useState<KycRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const requestList = await getPendingKycUsers(adminDb);
            setRequests(requestList);
        } catch (error) {
            console.error("Erreur lors de la récupération des demandes KYC:", error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les demandes KYC.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // Change: Updated logic to handle the new KYC submission flow.
    const handleKycAction = async (userId: string, status: 'verified' | 'unverified') => {
        setUpdatingId(userId);
        try {
            const submissionRef = doc(adminDb, 'kycSubmissions', userId);

            if (status === 'verified') {
                // 1. Update the user's profile
                await updateUserInFirestore(userId, { kycStatus: 'verified' }, adminDb);
                // 2. Delete the submission document
                await deleteDoc(submissionRef);
                toast({ title: 'Utilisateur approuvé', description: `Le statut KYC de l'utilisateur a été mis à jour.` });
            } else { // 'unverified'
                // Just delete the submission. The user's status remains 'unverified'.
                await deleteDoc(submissionRef);
                toast({ variant: 'destructive', title: 'Demande rejetée', description: 'La soumission KYC a été supprimée.' });
            }
            // Refresh list after action
            fetchRequests();
        } catch (error) {
            console.error("Erreur lors de la mise à jour du statut KYC:", error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'La mise à jour du statut a échoué.' });
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

    const kycActionButtons = (userId: string) => {
        if (updatingId === userId) {
            return (
                <Button variant="outline" size="sm" disabled>
                    <Loader2 className="h-4 w-4 animate-spin" />
                </Button>
            );
        }
        return (
            <>
                <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-100" onClick={() => handleKycAction(userId, 'verified')}>
                    <CheckCircle className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-100" onClick={() => handleKycAction(userId, 'unverified')}>
                    <XCircle className="h-5 w-5" />
                </Button>
                <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/users/${userId}`}>Voir</Link>
                </Button>
            </>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Demandes en attente</CardTitle>
                <CardDescription>
                    Examinez les demandes de vérification d'identité en attente.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Desktop view */}
                <div className="hidden md:block">
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
                                        {user.kycSubmittedAt ? format(user.kycSubmittedAt, 'dd MMMM yyyy', { locale: fr }) : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {kycActionButtons(user.uid)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                 {/* Mobile view */}
                 <div className="md:hidden">
                    <div className="space-y-4">
                        {requests.map(user => (
                            <div key={user.uid} className="border rounded-lg p-4 space-y-3">
                                <div>
                                    <p className="font-semibold">{user.firstName} {user.lastName}</p>
                                    <p className="text-sm text-muted-foreground break-all">{user.email}</p>
                                </div>
                                <div className="text-sm text-muted-foreground pt-2 border-t">
                                    Soumis le: {user.kycSubmittedAt ? format(user.kycSubmittedAt, 'dd/MM/yy', { locale: fr }) : 'N/A'}
                                </div>
                                <div className="flex justify-end items-center gap-2">
                                    {kycActionButtons(user.uid)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
