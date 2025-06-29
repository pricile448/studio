
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShieldCheck, MessageSquare } from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    { title: "Utilisateurs Totaux", value: "1,234", icon: Users },
    { title: "Vérifications KYC en attente", value: "12", icon: ShieldCheck },
    { title: "Tickets de support ouverts", value: "3", icon: MessageSquare },
  ];

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
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Placeholder for future charts or tables */}
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
