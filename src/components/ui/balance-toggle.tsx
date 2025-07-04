
'use client';

import { useAuth } from '@/context/auth-context';
import { Button } from './button';
import { Eye, EyeOff } from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function BalanceToggle({ dict }: { dict: any }) {
  const { isBalanceVisible, toggleBalanceVisibility } = useAuth();

  return (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleBalanceVisibility}>
                    {isBalanceVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    <span className="sr-only">{isBalanceVisible ? dict.hideBalances : dict.showBalances}</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{isBalanceVisible ? dict.hideBalances : dict.showBalances}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
  );
}
