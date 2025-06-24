
'use client';

import { useState, useEffect } from 'react';
import type { Locale, Dictionary } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileDown, FileText } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

const mockUserDocuments = [
    { id: 'doc1', name: 'Identity Card.pdf', date: '2024-05-10' },
    { id: 'doc2', name: 'Proof of Address.pdf', date: '2024-05-12' },
    { id: 'doc3', name: 'Bank Statement Q1.pdf', date: '2024-04-05' },
];


export default function DocumentsPage({ params: { lang } }: { params: { lang: Locale } }) {
  const { userProfile, loading } = useAuth();
  const [dict, setDict] = useState<Dictionary | null>(null);

  useEffect(() => {
    getDictionary(lang).then(setDict);
  }, [lang]);

  if (loading || !userProfile || !dict) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }
  
  const docDict = dict.documents;
  
  const defaultDocuments = [
    { id: 'contract', name: docDict.serviceContract, date: userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString(lang) : 'N/A' },
    { id: 'privacy', name: docDict.privacyPolicy, date: userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString(lang) : 'N/A' },
  ];

  const documentsToDisplay = userProfile.kycStatus === 'verified' ? mockUserDocuments : defaultDocuments;

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
         <h1 className="text-3xl font-bold font-headline">{docDict.title}</h1>
         {userProfile.kycStatus === 'verified' && (
            <Button>
                <Upload className="mr-2" />
                {docDict.upload}
            </Button>
         )}
       </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{docDict.title}</CardTitle>
          <CardDescription>{docDict.description}</CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{docDict.documentName}</TableHead>
                <TableHead className="hidden md:table-cell">{docDict.uploadDate}</TableHead>
                <TableHead className="text-right">{docDict.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentsToDisplay.map((doc) => (
                <TableRow key={doc.id}>
                   <TableCell className="font-medium flex items-center gap-2">
                     <FileText className="h-5 w-5 text-muted-foreground" />
                     {doc.name}
                   </TableCell>
                   <TableCell className="hidden md:table-cell">{doc.date}</TableCell>
                   <TableCell className="text-right">
                     <Button variant="outline" size="sm">
                       <FileDown className="mr-2 h-4 w-4" />
                       {docDict.download}
                     </Button>
                   </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
