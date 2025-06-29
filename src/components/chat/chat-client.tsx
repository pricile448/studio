
'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { UserProfile, ChatMessage } from '@/lib/firebase/firestore';
import { getOrCreateChatId, addMessageToChat } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Loader2, Send, AlertTriangle, Trash2, Paperclip, File as FileIcon } from 'lucide-react';
import type { User } from 'firebase/auth';
import type { Dictionary } from '@/lib/dictionaries';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { uploadToCloudinary } from '@/services/cloudinary-service';

interface ChatClientProps {
    dict: Dictionary['chat'];
    user: User;
    userProfile: UserProfile;
}

const convertFileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export function ChatClient({ dict, user, userProfile }: ChatClientProps) {
    const [chatId, setChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const scrollAreaEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDeleting, startDeleteTransition] = useTransition();
    const { toast } = useToast();
    const { deleteMessage } = useAuth();
    
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
                    senderId: data.senderId,
                    timestamp: data.timestamp,
                    deletedForUser: data.deletedForUser,
                    text: data.text,
                    fileUrl: data.fileUrl,
                    fileName: data.fileName,
                    fileType: data.fileType,
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
        const textToSend = newMessage;
        setNewMessage(''); // Clear input immediately for better UX

        try {
            await addMessageToChat(chatId, {
                text: textToSend,
                senderId: user.uid,
                timestamp: Timestamp.now(),
            });
        } catch (error) {
            console.error("Error sending message:", error);
            // Restore message in the input box on failure
            setNewMessage(textToSend); 
        } finally {
            setIsSending(false);
        }
    };
    
    const handleDeleteMessage = (messageId?: string) => {
      if (!chatId || !messageId) return;
      startDeleteTransition(async () => {
        try {
          await deleteMessage(chatId, messageId);
          toast({ title: 'Message deleted' });
        } catch (error) {
          toast({ variant: 'destructive', title: 'Error', description: "Could not delete message." });
        }
      });
    }

    const handleSendFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!chatId) return;
    
        const file = event.target.files?.[0];
        if (!file) return;
    
        setIsSending(true);
        try {
            const dataUri = await convertFileToDataUri(file);
            const folder = `chat_attachments/${chatId}`;
            const url = await uploadToCloudinary(dataUri, folder);
    
            await addMessageToChat(chatId, {
                senderId: user.uid,
                timestamp: Timestamp.now(),
                fileUrl: url,
                fileName: file.name,
                fileType: file.type,
            });
    
        } catch (error) {
            console.error("Erreur lors de l'envoi du fichier:", error);
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Impossible d\'envoyer le fichier.',
            });
        } finally {
            setIsSending(false);
            if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        }
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
                        {messages.filter(msg => !msg.deletedForUser).map((msg, index) => {
                            const isUser = msg.senderId === user.uid;
                            return (
                                <div key={msg.id || index} className={cn('group flex items-end gap-2', isUser ? 'justify-end' : 'justify-start')}>
                                    {isUser && (
                                       <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Supprimer ce message ?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Cette action ne peut pas être annulée. Le message sera masqué pour vous.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteMessage(msg.id)} disabled={isDeleting}>
                                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin"/> : "Supprimer"}
                                                </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                    {!isUser && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{getInitials(dict.advisorName)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={cn(
                                        'max-w-xs md:max-w-md rounded-lg px-3 py-2 text-sm break-words',
                                        isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                    )}>
                                        {msg.fileUrl ? (
                                            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline">
                                                <FileIcon className="h-4 w-4" />
                                                <span>{msg.fileName || 'Fichier partagé'}</span>
                                            </a>
                                        ) : (
                                            <p>{msg.text}</p>
                                        )}
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
                        <input type="file" ref={fileInputRef} onChange={handleSendFile} className="hidden" />
                        <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isSending || !chatId}>
                            <Paperclip className="h-4 w-4" />
                            <span className="sr-only">Joindre un fichier</span>
                        </Button>
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
