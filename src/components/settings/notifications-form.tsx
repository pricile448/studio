'use client';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { Dictionary } from '@/lib/dictionaries';

interface NotificationsFormProps {
  dict: Dictionary['settings']['notifications'];
}

export function NotificationsForm({ dict }: NotificationsFormProps) {
  return (
    <form className="space-y-8">
       <div className="space-y-4">
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <h3 className="font-medium">{dict.email.title}</h3>
                    <p className="text-[0.8rem] text-muted-foreground">{dict.email.description}</p>
                </div>
                <Switch defaultChecked />
            </div>
             <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <h3 className="font-medium">{dict.promotions.title}</h3>
                    <p className="text-[0.8rem] text-muted-foreground">{dict.promotions.description}</p>
                </div>
                <Switch />
            </div>
             <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <h3 className="font-medium">{dict.security.title}</h3>
                    <p className="text-[0.8rem] text-muted-foreground">{dict.security.description}</p>
                </div>
                <Switch defaultChecked />
            </div>
       </div>
       <Button type="submit" disabled>{dict.saveButton}</Button>
    </form>
  );
}
