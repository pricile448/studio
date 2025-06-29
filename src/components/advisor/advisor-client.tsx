
'use client';

import { useEffect, useState, useRef } from 'react';
import { collection, query, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { ChatMessage } from '@/lib/firebase/firestore';
import { addMessageToChat, getUserFromFirestore } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Loader2, Send, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import type { Dictionary, Locale } from '@/lib/dictionaries';
import { Skeleton } from '../ui/skeleton';

interface AdvisorClientProps {
    dict: Dictionary;
    lang: Locale;
}

interface ChatSession {
    id: string;
    participants: string[];
    lastMessageText?: string;
    lastMessageTimestamp?: Timestamp;
    // We'll fetch user details separately
    otherParticipant?: {
        id: string;
        name: string;
        avatar: string;
    };
}

function ChatInterface({ chatSession, adminId, dict }: { chatSession: ChatSession, adminId: string, dict: Dictionary['chat'] }) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollAreaEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const q = query(collection(db, 'chats', chatSession.id, 'messages'), 'timestamp', 'asc');
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs: ChatMessage[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
            setMessages(msgs);
        });
        return () => unsubscribe();
    }, [chatSession.id]);

    useEffect(() => {
        scrollAreaEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        
        setIsSending(true);
        try {
            await addMessageToChat(chatSession.id, {
                text: newMessage,
                senderId: adminId,
                timestamp: Timestamp.now(),
            });
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsSending(false);
        }
    };

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

    return (
        <div className="flex flex-col h-full">
            <CardHeader>
                <CardTitle>{dict.title} avec {chatSession.otherParticipant?.name || 'Utilisateur'}</CardTitle>
            </CardHeader>
            <Separator />
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((msg, index) => {
                        const isAdvisor = msg.senderId === adminId;
                        return (
                             <div key={msg.id || index} className={cn('flex items-end gap-2', isAdvisor ? 'justify-end' : 'justify-start')}>
                                {!isAdvisor && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={chatSession.otherParticipant?.avatar} />
                                        <AvatarFallback>{getInitials(chatSession.otherParticipant?.name || 'U')}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn(
                                    'max-w-xs md:max-w-md rounded-lg px-3 py-2 text-sm break-words',
                                    isAdvisor ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                )}>
                                    <p>{msg.text}</p>
                                    <p className={cn("text-xs mt-1", isAdvisor ? "text-primary-foreground/70" : "text-muted-foreground/70")}>
                                        {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                {isAdvisor && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>{getInitials(dict.advisorName)}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        )
                    })}
                </div>
                <div ref={scrollAreaEndRef} />
            </ScrollArea>
            <div className="p-4 border-t bg-background">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={dict.inputPlaceholder}
                        disabled={isSending}
                    />
                    <Button type="submit" size="icon" disabled={isSending || !newMessage.trim()}>
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        <span className="sr-only">{dict.sendButton}</span>
                    </Button>
                </form>
            </div>
        </div>
    );
}


export function AdvisorClient({ dict, lang }: AdvisorClientProps) {
    const { user, userProfile } = useAuth();
    const [chats, setChats] = useState<ChatSession[]>([]);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        
        // This query no longer has orderBy, so it doesn't require a composite index.
        const q = query(collection(db, 'chats'));
        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const chatSessionsPromises = querySnapshot.docs.map(async (doc) => {
                const data = doc.data();
                const otherParticipantId = data.participants.find((p: string) => p !== user.uid);
                
                let otherParticipant;
                if (otherParticipantId) {
                    const userDoc = await getUserFromFirestore(otherParticipantId);
                    otherParticipant = userDoc ? { id: userDoc.uid, name: `${userDoc.firstName} ${userDoc.lastName}`, avatar: userDoc.photoURL || '' } : { id: otherParticipantId, name: 'Utilisateur Inconnu', avatar: ''};
                }

                return {
                    id: doc.id,
                    participants: data.participants,
                    lastMessageText: data.lastMessageText,
                    lastMessageTimestamp: data.lastMessageTimestamp,
                    otherParticipant,
                };
            });

            const resolvedChats = await Promise.all(chatSessionsPromises);

            // Sort on the client side to maintain order without needing a complex index
            resolvedChats.sort((a, b) => {
                const timeA = a.lastMessageTimestamp?.toMillis() || 0;
                const timeB = b.lastMessageTimestamp?.toMillis() || 0;
                return timeB - timeA;
            });
            
            setChats(resolvedChats);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching chats: ", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (!userProfile) return <Skeleton className="h-full w-full" />;

    const selectedChat = chats.find(c => c.id === selectedChatId);

    return (
        <div className="flex flex-col h-full gap-4">
            <h1 className="text-3xl font-bold font-headline">{dict.sidebar.advisor}</h1>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full min-h-[calc(100vh-200px)]">
                <Card className="md:col-span-1 h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Conversations</CardTitle>
                    </CardHeader>
                    <Separator />
                    <ScrollArea className="flex-1">
                        <CardContent className="p-0">
                           {isLoading && <div className="p-6 space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>}
                           {!isLoading && chats.length === 0 && <p className="p-6 text-muted-foreground">Aucune conversation.</p>}
                           {chats.map(chat => (
                               <div key={chat.id} onClick={() => setSelectedChatId(chat.id)} className={cn("p-4 cursor-pointer hover:bg-muted/50 border-b", selectedChatId === chat.id && "bg-muted")}>
                                   <p className="font-semibold">{chat.otherParticipant?.name || 'Utilisateur'}</p>
                                   <p className="text-sm text-muted-foreground truncate">{chat.lastMessageText || 'Aucun message'}</p>
                               </div>
                           ))}
                        </CardContent>
                    </ScrollArea>
                </Card>

                <Card className="md:col-span-2 h-full flex flex-col">
                   {selectedChat && user ? (
                       <ChatInterface chatSession={selectedChat} adminId={user.uid} dict={dict.chat} />
                   ) : (
                       <div className="flex flex-col items-center justify-center h-full text-center p-8">
                           <MessageSquare className="h-16 w-16 text-muted-foreground/50" />
                           <h3 className="mt-4 text-lg font-medium">Sélectionnez une conversation</h3>
                           <p className="text-muted-foreground">Choisissez une conversation dans la liste de gauche pour afficher les messages.</p>
                       </div>
                   )}
                </Card>
            </div>
        </div>
    );
}
