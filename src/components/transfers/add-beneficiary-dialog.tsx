
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
import { UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Dictionary } from '@/lib/dictionaries';

interface AddBeneficiaryDialogProps {
  dict: Dictionary['transfers'];
}

const beneficiarySchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    iban: z.string().min(14, { message: 'Please enter a valid IBAN.' }),
    nickname: z.string().optional(),
});

type BeneficiaryFormValues = z.infer<typeof beneficiarySchema>;

export function AddBeneficiaryDialog({ dict }: AddBeneficiaryDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<BeneficiaryFormValues>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      name: '',
      iban: '',
      nickname: '',
    },
  });

  const onSubmit = (data: BeneficiaryFormValues) => {
    // In a real app, you would save the beneficiary data to your backend here.
    console.log(data);
    toast({
      title: dict.beneficiaryAdded,
      description: `${data.name} ${dict.beneficiaryAddedDescription}`,
    });
    form.reset();
    setOpen(false);
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
                <Button type="submit">{dict.saveBeneficiaryButton}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
