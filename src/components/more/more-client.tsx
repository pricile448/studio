
'use client';

import jsPDF from 'jspdf';
import type { Locale, Dictionary } from '@/lib/dictionaries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, FileText } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useUserProfile } from '@/context/user-profile-context';
import { Skeleton } from '@/components/ui/skeleton';
import { AddDocumentDialog } from './add-document-dialog';
import { useState } from 'react';

interface MoreClientProps {
  dict: Dictionary;
  lang: Locale;
}

const getCloudinaryDownloadUrl = (url: string): string => {
    if (!url) return '';
    const urlParts = url.split('/upload/');
    if (urlParts.length !== 2) {
        return url;
    }
    const [baseUrl, assetPath] = urlParts;
    return `${baseUrl}/upload/fl_attachment/${assetPath}`;
};

export function MoreClient({ dict, lang }: MoreClientProps) {
  const { userProfile, loading } = useUserProfile();
  // We add a state to force a re-render when a new document is uploaded
  const [, setRefresh] = useState(0);

  if (loading || !userProfile) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }
  
  const docDict = dict.documents;
  
  const defaultDocuments = [
    { id: 'contract', name: docDict.serviceContract, date: userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString(lang) : 'N/A', type: 'default' as const, url: '' },
    { id: 'privacy', name: docDict.privacyPolicy, date: userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString(lang) : 'N/A', type: 'default' as const, url: '' },
  ];
  
  const userUploadedDocuments = (userProfile.documents || []).map(doc => ({
    ...doc,
    date: doc.createdAt.toDate().toLocaleDateString(lang),
    type: 'user' as const
  }));

  const documentsToDisplay = [...defaultDocuments, ...userUploadedDocuments].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleDownloadDefault = (docType: 'contract' | 'privacy') => {
    const doc = new jsPDF();
    
    if (docType === 'contract') {
      doc.setFontSize(18);
      doc.text(docDict.serviceContract, 20, 20);
      doc.setFontSize(12);
      doc.text('This is a placeholder for the service agreement content.', 20, 30);
      doc.text('In a real application, this would contain the full legal text.', 20, 40);
      doc.save('Service_Agreement.pdf');
    } else if (docType === 'privacy') {
      doc.setFontSize(18);
      doc.text(docDict.privacyPolicy, 20, 20);
      doc.setFontSize(12);
      doc.text('This is a placeholder for the privacy policy content.', 20, 30);
      doc.text('Your data is handled with care. This document would detail our practices.', 20, 40);
      doc.save('Privacy_Policy.pdf');
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
         <h1 className="text-3xl font-bold font-headline">{docDict.title}</h1>
         {userProfile.kycStatus === 'verified' && (
            <AddDocumentDialog dict={docDict} onUpload={() => setRefresh(r => r + 1)} />
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
                    {doc.type === 'default' ? (
                      <Button variant="outline" size="sm" onClick={() => handleDownloadDefault(doc.id as 'contract' | 'privacy')}>
                        <FileDown className="mr-2 h-4 w-4" />
                        {docDict.download}
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" asChild>
                        <a href={getCloudinaryDownloadUrl(doc.url)} download={doc.name}>
                            <FileDown className="mr-2 h-4 w-4" />
                            {docDict.download}
                        </a>
                      </Button>
                    )}
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
