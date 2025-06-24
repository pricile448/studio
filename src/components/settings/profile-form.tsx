
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Upload, Loader2 } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { Dictionary } from '@/lib/dictionaries';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';

interface ProfileFormProps {
  dict: Dictionary['settings']['profile'];
}

const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  phone: z.string().optional(),
  dob: z.date({ required_error: 'A date of birth is required.' }),
  street: z.string(),
  city: z.string(),
  postalCode: z.string(),
  country: z.string(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm({ dict }: ProfileFormProps) {
  const { user, userProfile, updateUserAvatar } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = React.useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      street: '',
      city: '',
      postalCode: '',
      country: '',
    },
    mode: 'onChange',
  });

  React.useEffect(() => {
    if (userProfile) {
      form.reset({
        name: `${userProfile.firstName} ${userProfile.lastName}`,
        email: userProfile.email,
        dob: userProfile.dob,
        street: userProfile.address,
        country: userProfile.residenceCountry,
        phone: '', // This field is not in the UserProfile data model
        city: '', // This field is not in the UserProfile data model
        postalCode: '', // This field is not in the UserProfile data model
      });
    }
  }, [userProfile, form]);
  
  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        await updateUserAvatar(file);
        toast({ title: dict.avatarUpdated });
      } catch (error) {
        toast({ variant: 'destructive', title: dict.avatarUpdateFailed, description: (error as Error).message });
      } finally {
        setIsUploading(false);
      }
    }
  };

  function onSubmit(data: ProfileFormValues) {
    // This will be implemented later
  }

  if (!userProfile || !user) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
             <Skeleton className="h-10 w-36" />
             <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        </div>
      </div>
    )
  }
  
  const initials = userProfile ? `${userProfile.firstName?.charAt(0) ?? ''}${userProfile.lastName?.charAt(0) ?? ''}`.toUpperCase() : '';

  return (
    <>
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-20 w-20">
            <AvatarImage src={user.photoURL || ''} alt="User avatar" />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <div>
            <Label htmlFor="avatar-upload" className={cn(buttonVariants({ variant: 'outline' }), 'cursor-pointer')}>
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {dict.changeAvatarButton}
            </Label>
            <Input id="avatar-upload" type="file" className="sr-only" onChange={handleAvatarChange} accept="image/png, image/jpeg, image/gif" disabled={isUploading} />
            <p className="text-xs text-muted-foreground mt-2">{dict.avatarHint}</p>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.nameLabel}</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>{dict.emailLabel}</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.phoneLabel}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem className="flex flex-col pt-2">
                  <FormLabel>{dict.dobLabel}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn('w-full text-left font-normal', !field.value && 'text-muted-foreground')}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>{dict.dobPlaceholder}</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <h3 className="text-lg font-medium">{dict.addressGroupTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{dict.streetLabel}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dict.cityLabel}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dict.postalCodeLabel}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dict.countryLabel}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button type="submit" disabled>{dict.saveButton}</Button>
        </form>
      </Form>
    </>
  );
}
