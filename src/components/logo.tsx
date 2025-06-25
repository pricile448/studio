
import { cn } from "@/lib/utils";
import { Banknote } from "lucide-react";

interface LogoProps {
  text: string;
  className?: string;
}

export function Logo({ text, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
       <div className="bg-[#17E0E0] text-black p-1.5 rounded-lg">
        <Banknote className="h-5 w-5" />
       </div>
    </div>
  );
}
