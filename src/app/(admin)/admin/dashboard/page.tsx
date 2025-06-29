'use client';

import { useEffect, useState } from 'react';
import { getFirebaseServices } from '@/lib/firebase/config';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShieldCheck, MessageSquare, Loader2 } from "lucide-react";

// Utiliser l'instance de base de données de l'administrateur
const { db: adminDb } = getFirebaseServices('admin');

interface Stat {
    title: string;
    value: string | number;
    icon: React.ElementType;
    loading: boolean;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stat[]>([
    { title: "Utilisateurs Totaux", value: 0, icon: Users, loading: true },
    { title: "Vérifications KYC en attente", value: 0, icon: ShieldCheck, loading: true },
    { title: "Tickets de support ouverts", value: 3, icon: MessageSquare, loading: false }, // Valeur statique pour le moment
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Récupérer le nombre total d'utilisateurs avec la base de données admin
        const usersCollection = collection(adminDb, "users");
        const usersSnapshot = await getCountFromServer(usersCollection);
        const totalUsers = usersSnapshot.data().count;

        // Récupérer les demandes KYC en attente avec la base de données admin
        const kycQuery = query(collection(adminDb, "users"), where("kycStatus", "==", "pending"));
        const kycSnapshot = await getCountFromServer(kycQuery);
        const pendingKyc = kycSnapshot.data().count;
        
        setStats(prevStats => [
            { ...prevStats[0], value: totalUsers, loading: false },
            { ...prevStats[1], value: pendingKyc, loading: false },
            prevStats[2], // Conserver la statique
        ]);

      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error);
        setStats(prevStats => prevStats.map(stat => ({ ...stat, loading: false, value: 'Erreur' })));
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Tableau de bord Administrateur</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
  );
}
