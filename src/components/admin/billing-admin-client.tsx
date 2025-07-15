
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getBillingConfig, updateBillingConfig, type BillingConfig } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { adminDb } from '@/lib/firebase/admin';

const billingSchema = z.object({
  isEnabled: z.boolean(),
  holder: z.string().min(1, "Le nom du titulaire est requis."),
  iban: z.string().min(1, "L'IBAN est requis."),
  bic: z.string().min(1, "Le BIC est requis."),
  description: z.string().min(1, "La description est requise."),
});

type BillingFormValues = z.infer<typeof billingSchema>;

export function BillingAdminClient() {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<BillingFormValues>({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      isEnabled: true,
      holder: '',
      iban: '',
      bic: '',
      description: '',
    },
  });

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const config = await getBillingConfig(adminDb);
        if (config) {
          form.reset(config);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la configuration de facturation:", error);
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger la configuration.' });
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [form, toast]);

  const onSubmit = async (values: BillingFormValues) => {
    setIsSubmitting(true);
    try {
      await updateBillingConfig(values, adminDb);
      toast({ title: 'Succès', description: 'La configuration de la facturation a été mise à jour.' });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la configuration de facturation:", error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'La mise à jour a échoué.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><div className="space-y-4"><Skeleton className="h-10" /><Skeleton className="h-10" /><Skeleton className="h-24" /></div></CardContent></Card>
  }

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>Configurer la page de facturation</CardTitle>
        <CardDescription>
          Modifiez les informations affichées aux clients sur la page de facturation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="isEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Activer la page de facturation</FormLabel>
                    <FormMessage>Si désactivée, la page affichera un message informatif aux clients.</FormMessage>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="holder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titulaire du compte</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="iban"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IBAN</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BIC</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message affiché aux clients</FormLabel>
                  <FormControl><Textarea rows={4} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer les modifications
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
