
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Download, AlertTriangle } from 'lucide-react';
import { Logo } from '@/components/logo';

function PdfViewer() {
    const searchParams = useSearchParams();
    const pdfUrl = searchParams.get('url');

    if (!pdfUrl) {
         return (
            <div className="flex flex-col items-center justify-center h-screen text-center text-destructive bg-muted">
                <AlertTriangle className="w-16 h-16 mb-4" />
                <h2 className="text-2xl font-bold">Erreur</h2>
                <p>Aucune URL de PDF fournie.</p>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-screen bg-muted">
            <header className="flex items-center justify-between p-2 md:p-4 bg-background border-b shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                  <Logo text="AmCbunq" />
                  <h1 className="text-lg font-semibold font-headline text-foreground">Visionneuse de PDF</h1>
                </div>
                <Button asChild>
                    <a href={pdfUrl} download>
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger
                    </a>
                </Button>
            </header>
            <main className="flex-1 w-full h-full overflow-hidden">
                <object data={pdfUrl} type="application/pdf" width="100%" height="100%">
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <AlertTriangle className="w-12 h-12 mb-4 text-destructive" />
                        <h2 className="text-xl font-bold">Impossible d'afficher le PDF</h2>
                        <p className="text-muted-foreground mb-4">Votre navigateur ne prend peut-être pas en charge l'affichage des PDF de cette manière.</p>
                        <Button asChild>
                            <a href={pdfUrl} download>
                                <Download className="mr-2 h-4 w-4" />
                                Télécharger le PDF
                            </a>
                        </Button>
                    </div>
                </object>
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
