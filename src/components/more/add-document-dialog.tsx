
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
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import type { Dictionary } from '@/lib/dictionaries';

interface AddDocumentDialogProps {
  dict: Dictionary['documents'];
  onUpload: () => void;
}

const documentSchema = z.object({
  name: z.string().min(3, { message: 'Document name must be at least 3 characters.' }),
  file: z.instanceof(FileList).refine((files) => files?.length === 1, 'File is required.'),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

export function AddDocumentDialog({ dict, onUpload }: AddDocumentDialogProps) {
  const { toast } = useToast();
  const { uploadDocument } = useAuth();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = async (data: DocumentFormValues) => {
    setIsSubmitting(true);
    try {
      const file = data.file[0];
      await uploadDocument(file, data.name);
      toast({
        title: "Document Uploaded",
        description: `"${data.name}" has been successfully uploaded.`,
      });
      form.reset();
      setOpen(false);
      onUpload();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Upload Failed",
        description: (error as Error).message || "An unknown error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2" />
          {dict.upload}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{dict.upload}</DialogTitle>
              <DialogDescription>
                Select a document to upload securely.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2 pb-4">
              <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>{dict.documentName}</FormLabel>
                          <FormControl>
                              <Input placeholder="e.g., Payslip July" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>File</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => field.onChange(e.target.files)}
                            />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />
            </div>

            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary" disabled={isSubmitting}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Upload
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
