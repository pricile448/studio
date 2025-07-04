'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UserPlus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Dictionary } from '@/lib/dictionaries';
import { useAuth } from '@/context/auth-context';

interface AddBeneficiaryDialogProps {
  dict: Dictionary['transfers'];
  onBeneficiaryAdded: () => void;
}

const beneficiarySchema = z.object({
    name: z.string().min(2, { message: 'Le nom doit comporter au moins 2 caractères.' }),
    iban: z.string().min(14, { message: 'Veuillez saisir un IBAN valide.' }),
    bic: z.string().optional(),
    nickname: z.string().optional(),
});

type BeneficiaryFormValues = z.infer<typeof beneficiarySchema>;

export function AddBeneficiaryDialog({ dict, onBeneficiaryAdded }: AddBeneficiaryDialogProps) {
  const { toast } = useToast();
  const { addBeneficiary } = useAuth();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BeneficiaryFormValues>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      name: '',
      iban: '',
      bic: '',
      nickname: '',
    },
  });

  const onSubmit = async (data: BeneficiaryFormValues) => {
    setIsSubmitting(true);
    try {
      await addBeneficiary(data);
      toast({
        title: dict.beneficiaryAdded,
        description: `${data.name} ${dict.beneficiaryAddedDescription}`,
      });
      onBeneficiaryAdded(); // Callback to refresh parent component's state
      form.reset();
      setOpen(false);
    } catch (error) {
       toast({
        variant: 'destructive',
        title: "Erreur",
        description: (error as Error).message || "Échec de l'ajout du bénéficiaire.",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2" />
          {dict.addBeneficiary}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{dict.addBeneficiaryTitle}</DialogTitle>
              <DialogDescription>
                {dict.addBeneficiaryDescription}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2 pb-4">
              <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>{dict.beneficiaryNameLabel}</FormLabel>
                          <FormControl>
                              <Input placeholder={dict.beneficiaryNamePlaceholder} {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="iban"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>{dict.beneficiaryIbanLabel}</FormLabel>
                          <FormControl>
                              <Input placeholder="FR76..." {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />
               <FormField
                  control={form.control}
                  name="bic"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>{dict.beneficiaryBicLabel}</FormLabel>
                          <FormControl>
                              <Input placeholder="BNPAFRPPXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="nickname"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>{dict.beneficiaryNicknameLabel}</FormLabel>
                          <FormControl>
                              <Input placeholder={dict.beneficiaryNicknamePlaceholder} {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />
            </div>

            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">{dict.cancelButton}</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                   {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   {dict.saveBeneficiaryButton}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
