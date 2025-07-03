import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { ChatPageClient } from '@/components/chat/chat-page-client';

export const dynamic = 'force-dynamic';

export default async function ChatPage({ params }: { params: { lang: Locale } }) {
  const { lang } = params;
  const dict = await getDictionary(lang);
  
  return (
    <div className="flex flex-col h-full gap-4">
      <h1 className="text-3xl font-bold font-headline">{dict.chat.headerTitle}</h1>
      <div className="flex-1">
        <ChatPageClient dict={dict} />
      </div>
    </div>
  );
}
