'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Dictionary } from '@/lib/dictionaries';

interface ProfileFormProps {
  dict: Dictionary['settings']['profile'];
}

export function ProfileForm({ dict }: ProfileFormProps) {
  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{dict.nameLabel}</Label>
        <Input id="name" defaultValue="User Name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{dict.emailLabel}</Label>
        <Input id="email" type="email" defaultValue="user@example.com" />
      </div>
      <Button type="submit" disabled>{dict.saveButton}</Button>
    </form>
  );
}
