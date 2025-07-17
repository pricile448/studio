import type { Locale } from '@/lib/dictionaries';
import { getDictionary } from '@/lib/get-dictionary';
import { ChatPageClient } from '@/components/chat/chat-page-client';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ lang: Locale }>;
}

export default async function ChatPage({ params }: Props) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  return (
    <div className="flex flex-col h-full gap-4">
      <h1 className="text-3xl font-bold font-headline shrink-0 break-words">{dict.chat.headerTitle}</h1>
      <div className="flex-1 min-h-0">
        <ChatPageClient dict={dict} />
      </div>
    </div>
  );
}
