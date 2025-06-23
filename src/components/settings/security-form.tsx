'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Dictionary } from '@/lib/dictionaries';
import { Separator } from '../ui/separator';

interface SecurityFormProps {
  dict: Dictionary['settings']['security'];
}

export function SecurityForm({ dict }: SecurityFormProps) {
  return (
    <form className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="current-password">{dict.currentPasswordLabel}</Label>
            <Input id="current-password" type="password" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="new-password">{dict.newPasswordLabel}</Label>
            <Input id="new-password" type="password" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="confirm-password">{dict.confirmPasswordLabel}</Label>
            <Input id="confirm-password" type="password" />
        </div>
        <Separator />
        <Button type="submit" disabled>{dict.saveButton}</Button>
    </form>
  );
}
