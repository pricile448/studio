
'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { UserProfile, ChatMessage } from '@/lib/firebase/firestore';
import { getOrCreateChatId, addMessageToChat } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Loader2, Send, AlertTriangle, Trash2, Paperclip, File as FileIcon, Download, FileText } from 'lucide-react';
import type { User } from 'firebase/auth';
import type { Dictionary } from '@/lib/dictionaries';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { useUserProfile } from '@/context/auth-context';
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { uploadChatAttachment } from '@/app/actions';
import Image from 'next/image';

interface ChatClientProps {
    dict: Dictionary;
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

const getCloudinaryDownloadUrl = (url: string): string => {
    if (!url) return '';
    // This logic works for both 'image/upload/' and 'raw/upload/' URLs
    const urlParts = url.split('/upload/');
    if (urlParts.length !== 2) {
        return url; // return original if format is unexpected
    }
    const [baseUrl, assetPath] = urlParts;
    return `${baseUrl}/upload/fl_attachment/${assetPath}`;
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
    const { deleteMessage } = useUserProfile();
    const [previewImage, setPreviewImage] = useState<{url: string; name: string} | null>(null);
    
    const advisorId = userProfile?.advisorId || 'advisor_123';
    const chatDict = dict.chat;

    // Effect to get or create the chat session
    useEffect(() => {
        if (!chatId && user.uid && advisorId) {
            setIsLoading(true);
            setError(null);
            getOrCreateChatId(user.uid, advisorId)
                .then(setChatId)
                .catch(err => {
                    console.error("Error getting chat ID:", err);
                    setError(chatDict.connectionErrorText);
                })
                .finally(() => setIsLoading(false));
        } else if (chatId) {
            setIsLoading(false);
        }
    }, [chatId, user.uid, advisorId, chatDict.connectionErrorText]);

    // Combined effect to manage listeners and prevent race conditions
    useEffect(() => {
        if (!chatId) {
            setMessages([]);
            return;
        }

        let unsubscribeMessages = () => {};

        const unsubscribeDoc = onSnapshot(doc(db, 'chats', chatId),
            (docSnap) => {
                if (docSnap.exists()) {
                    // Chat exists, safe to listen for messages.
                    const messagesQuery = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));
                    unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
                        const msgs: ChatMessage[] = [];
                        snapshot.forEach((doc) => {
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
                        setError(null); // Clear previous errors on success
                    }, (err) => {
                        console.error('Error listening to messages subcollection:', err);
                        setError(chatDict.connectionErrorText);
                    });
                } else {
                    // Chat was deleted. This is the key part of the fix.
                    // We immediately stop listening to messages and reset the chat state.
                    console.warn("Chat document was deleted. Resetting chat state.");
                    unsubscribeMessages(); // Stop listening to the old message path first.
                    setChatId(null);       // Then, trigger the re-initialization flow.
                }
            },
            (err) => {
                console.error("Error listening to chat document:", err);
                unsubscribeMessages(); // Also clean up on error
                setChatId(null);
                setError(chatDict.connectionErrorText);
            }
        );

        // Main cleanup for the entire effect
        return () => {
            unsubscribeDoc();
            unsubscribeMessages();
        };
    }, [chatId, chatDict.connectionErrorText]);

    useEffect(() => {
        scrollAreaEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !chatId) return;
        
        setIsSending(true);
        const textToSend = newMessage;
        setNewMessage('');

        try {
            await addMessageToChat(chatId, {
                text: textToSend,
                senderId: user.uid,
                timestamp: Timestamp.now(),
            });
        } catch (error) {
            console.error("Error sending message:", error);
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
            const result = await uploadChatAttachment(chatId, dataUri, file.name);

            if (!result.success || !result.url) {
                throw new Error(result.error || "Échec du téléversement du fichier.");
            }
    
            await addMessageToChat(chatId, {
                senderId: user.uid,
                timestamp: Timestamp.now(),
                fileUrl: result.url,
                fileName: file.name,
                fileType: file.type,
            });
    
        } catch (error) {
            console.error("Erreur lors de l'envoi du fichier:", error);
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: (error as Error).message || 'Impossible d\'envoyer le fichier.',
            });
        } finally {
            setIsSending(false);
            if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('');
    }
    
    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full p-4">
                <Alert variant="destructive" className="max-w-md">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{chatDict.connectionError}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <Dialog open={!!previewImage} onOpenChange={(isOpen) => !isOpen && setPreviewImage(null)}>
                <DialogContent className="max-w-4xl w-full h-[90vh] p-0 border-0 bg-transparent shadow-none">
                        <DialogHeader className="sr-only">
                        <DialogTitle>Aperçu de l'image</DialogTitle>
                        </DialogHeader>
                    {previewImage && (
                        <div className="relative w-full h-full flex flex-col">
                            <div className="relative flex-1">
                                <Image src={previewImage.url} alt={previewImage.name || 'Preview'} fill style={{objectFit: 'contain'}} />
                            </div>
                            <DialogFooter className="p-2 sm:justify-between bg-black/50 backdrop-blur-sm border-t border-black/20 text-white">
                                <span className="font-medium hidden sm:block truncate">{previewImage.name}</span>
                                <div className="flex gap-2 w-full sm:w-auto justify-end">
                                    <Button variant="secondary" asChild>
                                        <a href={getCloudinaryDownloadUrl(previewImage.url)} download={previewImage.name}>
                                            <Download className="mr-2 h-4 w-4" />
                                            {dict.documents.download}
                                        </a>
                                    </Button>
                                    <DialogClose asChild>
                                        <Button variant="secondary">{dict.cards.closeButton}</Button>
                                    </DialogClose>
                                </div>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center text-muted-foreground p-8">
                            <p className="font-medium">{chatDict.welcomeMessage}</p>
                            <p className="text-xs mt-2">{chatDict.welcomeMessageSubtext}</p>
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
                                        <AvatarFallback>{getInitials(chatDict.advisorName)}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn(
                                    'max-w-[85%] md:max-w-md rounded-lg px-3 py-2 text-sm break-words',
                                    isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                )}>
                                    <div className={cn(msg.text ? 'mb-1' : '')}>
                                        {msg.fileUrl && msg.fileType?.startsWith('image/') ? (
                                            <button
                                            onClick={() => setPreviewImage({ url: msg.fileUrl!, name: msg.fileName || 'image.png' })}
                                            className="block relative w-48 h-48 rounded-md overflow-hidden cursor-pointer"
                                            >
                                            <Image
                                                src={msg.fileUrl}
                                                alt={msg.fileName || 'Image en pièce jointe'}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                            </button>
                                        ) : msg.fileUrl ? (
                                            <a
                                                href={getCloudinaryDownloadUrl(msg.fileUrl)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={cn(
                                                    "flex items-center gap-2 p-2 rounded-md transition-colors",
                                                    isUser ? "bg-white/20 hover:bg-white/30" : "bg-black/5 hover:bg-black/10"
                                                )}
                                            >
                                                {msg.fileType === 'application/pdf' ? <FileText className="h-6 w-6 flex-shrink-0" /> : <FileIcon className="h-6 w-6 flex-shrink-0" />}
                                                <span className="font-medium truncate min-w-0">{msg.fileName || 'Fichier partagé'}</span>
                                            </a>
                                        ) : null}
                                    </div>
                                    {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                                    <p className={cn("text-xs mt-1 text-right", isUser ? "text-primary-foreground/70" : "text-muted-foreground/70")}>
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
                    <div ref={scrollAreaEndRef} />
                </div>
            </ScrollArea>

            <div className="p-4 border-t bg-background">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={chatDict.inputPlaceholder}
                        disabled={isSending || !chatId}
                    />
                    <input type="file" ref={fileInputRef} onChange={handleSendFile} className="hidden" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isSending || !chatId}>
                        <Paperclip className="h-4 w-4" />
                        <span className="sr-only">Joindre un fichier</span>
                    </Button>
                    <Button type="submit" size="icon" disabled={isSending || !newMessage.trim() || !chatId}>
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        <span className="sr-only">{chatDict.sendButton}</span>
                    </Button>
                </form>
            </div>
        </div>
    );
}
