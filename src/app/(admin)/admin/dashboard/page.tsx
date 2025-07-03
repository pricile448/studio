'use client';

import { useEffect, useState } from 'react';
import { getFirebaseServices } from '@/lib/firebase/config';
import { collection, query, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShieldCheck, MessageSquare, Loader2, ShieldX, ShieldQuestion } from "lucide-react";

const { db } = getFirebaseServices('admin');

interface Stat {
    title: string;
    value: string | number;
    icon: React.ElementType;
    loading: boolean;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stat[]>([
    { title: "Utilisateurs Totaux", value: 0, icon: Users, loading: true },
    { title: "Vérifications en attente", value: 0, icon: ShieldQuestion, loading: true },
    { title: "Vérifications approuvées", value: 0, icon: ShieldCheck, loading: true },
    { title: "Vérifications rejetées", value: 0, icon: ShieldX, loading: true },
    { title: "Tickets de support ouverts", value: 3, icon: MessageSquare, loading: false },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Récupérer le nombre total d'utilisateurs
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const totalUsers = usersSnapshot.size;

        // Récupérer toutes les soumissions KYC pour les compter
        const kycCollection = collection(db, "kycSubmissions");
        const kycSnapshot = await getDocs(kycCollection);
        
        let pendingKyc = 0;
        let approvedKyc = 0;
        let rejectedKyc = 0;
        
        kycSnapshot.forEach(doc => {
            const status = doc.data().status;
            if (status === 'pending') {
                pendingKyc++;
            } else if (status === 'approved') {
                approvedKyc++;
            } else if (status === 'rejected') {
                rejectedKyc++;
            }
        });
        
        setStats(prevStats => [
            { ...prevStats[0], value: totalUsers, loading: false },
            { ...prevStats[1], value: pendingKyc, loading: false },
            { ...prevStats[2], value: approvedKyc, loading: false },
            { ...prevStats[3], value: rejectedKyc, loading: false },
            prevStats[4], // Conserver la statique
        ]);

      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error);
        setStats(prevStats => prevStats.map(stat => ({ ...stat, loading: false, value: 'Erreur' })));
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-3xl font-bold font-headline shrink-0 mb-6">Tableau de bord Administrateur</h1>
      
      <div className="flex-1 min-h-0 overflow-y-auto pr-2 -mr-2">
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    {stat.loading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                        <div className="text-2xl font-bold">{stat.value}</div>
                    )}
                    </CardContent>
                </Card>
                );
            })}
            </div>

            <Card>
            <CardHeader>
                <CardTitle>Activité Récente</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Les graphiques et les journaux d'activité seront affichés ici.</p>
            </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
