
import { cn } from "@/lib/utils";
import { Banknote } from "lucide-react";

interface LogoProps {
  text: string;
  className?: string;
}

export function Logo({ text, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
       <div className="bg-gradient-to-br from-primary to-primary-gradient-end text-white p-1.5 rounded-lg">
        <Banknote className="h-5 w-5" />
       </div>
    </div>
  );
}
