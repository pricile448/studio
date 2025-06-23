
import { type Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileDown, FileText } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const mockDocuments = [
    { id: 'doc1', name: 'Identity Card.pdf', date: '2024-05-10' },
    { id: 'doc2', name: 'Proof of Address.pdf', date: '2024-05-12' },
    { id: 'doc3', name: 'Bank Statement Q1.pdf', date: '2024-04-05' },
];


export default async function DocumentsPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);
  const docDict = dict.documents;

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
         <h1 className="text-3xl font-bold font-headline">{docDict.title}</h1>
         <Button>
             <Upload className="mr-2" />
             {docDict.upload}
         </Button>
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDocuments.map((doc) => (
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
