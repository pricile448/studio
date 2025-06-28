
'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { UserProfile, ChatMessage } from '@/lib/firebase/firestore';
import { sendMessage } from '@/app/[lang]/(dashboard)/chat/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Loader2, Send, AlertTriangle } from 'lucide-react';
import { getOrCreateChatId } from '@/lib/firebase/firestore';
import type { User } from 'firebase/auth';
import type { Dictionary } from '@/lib/dictionaries';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

interface ChatClientProps {
    dict: Dictionary['chat'];
    user: User;
    userProfile: UserProfile;
}

export function ChatClient({ dict, user, userProfile }: ChatClientProps) {
    const [chatId, setChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const scrollAreaEndRef = useRef<HTMLDivElement>(null);
    
    const advisorId = userProfile?.advisorId || 'advisor_123';

    useEffect(() => {
        if (user.uid && advisorId) {
            setIsLoading(true);
            setError(null);
            getOrCreateChatId(user.uid, advisorId)
                .then(setChatId)
                .catch(err => {
                    console.error("Error getting chat ID:", err);
                    setError(dict.connectionErrorText);
                })
                .finally(() => setIsLoading(false));
        }
    }, [user.uid, advisorId, dict.connectionErrorText]);

    useEffect(() => {
        if (!chatId) return;

        const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs: ChatMessage[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                msgs.push({
                    id: doc.id,
                    text: data.text,
                    senderId: data.senderId,
                    timestamp: data.timestamp,
                });
            });
            setMessages(msgs);
        }, (err) => {
            console.error("Error listening to messages:", err);
            setError("Failed to load messages.");
        });

        return () => unsubscribe();
    }, [chatId]);

    useEffect(() => {
        scrollAreaEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !chatId) return;
        setIsSending(true);
        await sendMessage({
            text: newMessage,
            userId: user.uid,
            advisorId: advisorId,
        });
        setNewMessage('');
        setIsSending(false);
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('');
    }
    
    const renderContent = () => {
        if (isLoading) {
            return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
        }

        if (error) {
            return (
                <div className="flex items-center justify-center h-full p-4">
                    <Alert variant="destructive" className="max-w-md">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{dict.connectionError}</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            )
        }
        
        return (
            <>
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground p-8">
                                <p className="font-medium">{dict.welcomeMessage}</p>
                                <p className="text-xs mt-2">{dict.welcomeMessageSubtext}</p>
                            </div>
                        )}
                        {messages.map((msg, index) => {
                            const isUser = msg.senderId === user.uid;
                            return (
                                <div key={msg.id || index} className={cn('flex items-end gap-2', isUser ? 'justify-end' : 'justify-start')}>
                                    {!isUser && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{getInitials(dict.advisorName)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={cn(
                                        'max-w-xs md:max-w-md rounded-lg px-3 py-2 text-sm break-words',
                                        isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                    )}>
                                        <p>{msg.text}</p>
                                        <p className={cn("text-xs mt-1", isUser ? "text-primary-foreground/70" : "text-muted-foreground/70")}>
                                            {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    {isUser && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'user'} />
                                            <AvatarFallback>{getInitials(user.displayName || 'U')}</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div ref={scrollAreaEndRef} />
                </ScrollArea>
                <div className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={dict.inputPlaceholder}
                            disabled={isSending || !chatId}
                        />
                        <Button type="submit" size="icon" disabled={isSending || !newMessage.trim() || !chatId}>
                            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            <span className="sr-only">{dict.sendButton}</span>
                        </Button>
                    </form>
                </div>
            </>
        )
    }

    return (
        <div className="flex flex-col h-full">
            {renderContent()}
        </div>
    );
}
