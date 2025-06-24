
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { Dictionary } from '@/lib/dictionaries';
import { Separator } from '../ui/separator';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface SecurityFormProps {
  dict: Dictionary['settings']['security'];
  lang: string;
}

const securityFormSchema = (dict: Dictionary['settings']['security']) => z.object({
  newPassword: z.string().min(6, dict.passwordLengthError),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: dict.passwordMismatchError,
  path: ['confirmPassword'],
});

type SecurityFormValues = z.infer<ReturnType<typeof securityFormSchema>>;

export function SecurityForm({ dict, lang }: SecurityFormProps) {
  const { updateUserPassword } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema(dict)),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SecurityFormValues) => {
    setIsSubmitting(true);
    try {
      await updateUserPassword(data.newPassword);
      toast({ title: dict.passwordUpdateSuccess });
      form.reset();
    } catch (error: any) {
      let description = dict.passwordUpdateError;
      if (error.code === 'auth/requires-recent-login') {
        description = dict.reauthenticationRequired;
      }
      toast({ variant: 'destructive', title: dict.passwordUpdateErrorTitle, description });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.newPasswordLabel}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.confirmPasswordLabel}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Separator />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {dict.saveButton}
        </Button>
      </form>
    </Form>
  );
}
