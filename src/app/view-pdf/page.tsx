
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Download, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Logo } from '@/components/logo';

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

// Setup PDF.js worker from a public CDN to avoid webpack configuration issues.
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


function PdfViewer() {
    const searchParams = useSearchParams();
    const pdfUrl = searchParams.get('url');
    const { toast } = useToast();

    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setPageNumber(1);
    }
    
    function onDocumentLoadError(error: Error) {
        console.error("Error loading PDF:", error);
        toast({
            variant: 'destructive',
            title: 'Erreur de chargement du PDF',
            description: "Impossible de charger le document. Il est peut-être corrompu ou inaccessible.",
        });
    }

    function changePage(offset: number) {
        setPageNumber(prevPageNumber => prevPageNumber + offset);
    }

    function previousPage() {
        if (pageNumber > 1) {
            changePage(-1);
        }
    }

    function nextPage() {
        if (numPages && pageNumber < numPages) {
            changePage(1);
        }
    }

    if (!pdfUrl) {
         return (
            <div className="flex flex-col items-center justify-center h-full text-center text-destructive">
                <AlertTriangle className="w-16 h-16 mb-4" />
                <h2 className="text-2xl font-bold">Erreur</h2>
                <p>Aucune URL de PDF fournie.</p>
            </div>
        );
    }
    
    const loadingSpinner = (
        <div className="flex items-center justify-center h-full w-full absolute inset-0">
            <Loader2 className="w-8 h-8 animate-spin" />
        </div>
    );
    

    return (
        <div className="flex flex-col h-screen bg-muted">
            <header className="flex items-center justify-between p-2 md:p-4 bg-background border-b shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                  <Logo text="AmCbunq" />
                  <h1 className="text-lg font-semibold font-headline text-foreground">Visionneuse de PDF</h1>
                </div>
                 {numPages && (
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={previousPage} disabled={pageNumber <= 1}>
                            <ChevronLeft />
                        </Button>
                        <span className="text-sm font-medium">
                            Page {pageNumber} sur {numPages}
                        </span>
                        <Button variant="outline" size="icon" onClick={nextPage} disabled={pageNumber >= numPages}>
                            <ChevronRight />
                        </Button>
                    </div>
                )}
                <Button asChild>
                    <a href={pdfUrl} download>
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger
                    </a>
                </Button>
            </header>
            <main className="flex-1 w-full h-full overflow-hidden">
                <ScrollArea className="h-full w-full">
                    <div className="flex justify-center p-4">
                       <Document
                            file={pdfUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading={loadingSpinner}
                        >
                            <Page pageNumber={pageNumber} renderTextLayer={true} />
                        </Document>
                    </div>
                </ScrollArea>
            </main>
        </div>
    );
}

export default function ViewPdfPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
            <PdfViewer />
        </Suspense>
    );
}
