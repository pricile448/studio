'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { HardHat } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service in a real app
    console.error(error)
  }, [error])

  return (
    <html lang="fr">
      <body>
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
            <HardHat className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            Oups ! Une erreur est survenue.
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Nous rencontrons actuellement des difficultés techniques. Notre équipe a été informée et travaille à la résolution du problème. Veuillez nous excuser pour la gêne occasionnée.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button onClick={() => reset()}>
              Réessayer
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                Retour à l'accueil
              </Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}
