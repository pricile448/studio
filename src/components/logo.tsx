
import { cn } from "@/lib/utils";

interface LogoProps {
  text: string;
  className?: string;
}

export function Logo({ text, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
       <div className="rounded-lg overflow-hidden h-8 w-8">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
        >
          <path d="M0 0H24V24H0V0Z" fill="#06b6d4" />
          <path d="M0 0L24 0L0 24V0Z" fill="#0c4a6e" />
        </svg>
      </div>
    </div>
  );
}
