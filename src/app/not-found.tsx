
import { Separator } from '@/components/ui/separator';

export default function NotFound() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex items-center gap-4 text-foreground">
        <h1 className="text-2xl font-bold">404</h1>
        <Separator orientation="vertical" className="h-8" />
        <p>This page could not be found.</p>
      </div>
    </div>
  );
}
