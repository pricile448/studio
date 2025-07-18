'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useState, useTransition } from 'react';
import { contactSupport } from '@/ai/flows/contact-support-flow';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import type { Dictionary } from '@/lib/dictionaries';
import type { ContactSupportInput } from '@/lib/types';
import { ContactSupportInputSchema } from '@/lib/types';


export function HelpContactForm({ dict }: { dict: Dictionary['help'] }) {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ContactSupportInput>({
    resolver: zodResolver(ContactSupportInputSchema),
    defaultValues: {
      name: userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : '',
      email: userProfile?.email || '',
      subject: '',
      message: '',
    },
  });

  async function onSubmit(data: ContactSupportInput) {
    startTransition(async () => {
        const result = await contactSupport(data);
        if (result.success) {
            toast({
                title: dict.contactForm.successTitle,
                description: dict.contactForm.successDescription,
            });
            form.reset();
        } else {
            toast({
                variant: 'destructive',
                title: dict.contactForm.errorTitle,
                description: result.error || dict.contactForm.errorDescription,
            });
        }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>{dict.contactForm.nameLabel}</FormLabel>
                <FormControl>
                    <Input placeholder={dict.contactForm.namePlaceholder} {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                <FormLabel>{dict.contactForm.emailLabel}</FormLabel>
                <FormControl>
                    <Input placeholder={dict.contactForm.emailPlaceholder} {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.contactForm.subjectLabel}</FormLabel>
              <FormControl>
                <Input placeholder={dict.contactForm.placeholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.contactForm.messageLabel}</FormLabel>
              <FormControl>
                <Textarea placeholder={dict.contactForm.messagePlaceholder} rows={6} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {dict.contactForm.submitButton}
        </Button>
      </form>
    </Form>
  );
}
