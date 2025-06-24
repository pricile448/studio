
import { ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Locale } from '@/lib/dictionaries';

interface KycPromptProps {
    lang: Locale;
    title: string;
    description: string;
    buttonText: string;
}

export function KycPrompt({ lang, title, description, buttonText }: KycPromptProps) {
    return (
        <div className="flex flex-1 items-center justify-center">
            <Card className="w-full max-w-lg text-center shadow-lg">
                <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <ShieldAlert className="h-8 w-8" />
                    </div>
                    <CardTitle className="mt-4 font-headline">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href={`/${lang}/kyc`}>{buttonText}</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
