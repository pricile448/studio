
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Download, AlertTriangle } from 'lucide-react';
import { Logo } from '@/components/logo';

function PdfViewer() {
    const searchParams = useSearchParams();
    const pdfUrl = searchParams.get('url');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!pdfUrl) {
            setError('Aucune URL de PDF fournie.');
        }
    }, [pdfUrl]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-destructive">
                <AlertTriangle className="w-16 h-16 mb-4" />
                <h2 className="text-2xl font-bold">Erreur</h2>
                <p>{error}</p>
            </div>
        );
    }

    if (!pdfUrl) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    // Use the PDF URL directly in the iframe. This is more reliable than a third-party viewer.
    const embedUrl = pdfUrl;

    return (
        <div className="flex flex-col h-screen bg-muted">
            <header className="flex items-center justify-between p-4 bg-background border-b shadow-sm shrink-0">
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
            <main className="flex-1 w-full h-full">
                <iframe
                    src={embedUrl}
                    title="PDF Viewer"
                    className="w-full h-full border-0"
                />
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
