
'use client';

import { useEffect, useState, useRef, useTransition } from 'react';
import { collection, query, onSnapshot, Timestamp, orderBy } from 'firebase/firestore';
import type { ChatMessage, UserProfile } from '@/lib/firebase/firestore';
import { addMessageToChat, getUserFromFirestore, getAllUsers, getOrCreateChatId } from '@/lib/firebase/firestore';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Loader2, Send, MessageSquare, RefreshCw, Paperclip, File as FileIcon, ArrowLeft, Download, PlusCircle, FileText } from 'lucide-react';
import { useAdminAuth } from '@/context/admin-auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import type { Firestore } from 'firebase/firestore';
import { uploadChatAttachment } from '@/app/actions';
import Image from 'next/image';
import { useIsMobile } from '@/hooks/use-mobile';
import { getFirebaseServices } from '@/lib/firebase/config';
import { resetConversation as resetConversationAction, deleteAdminMessage as deleteAdminMessageAction } from '@/app/(admin)/actions';


const ADVISOR_ID = 'advisor_123';

interface ChatSession {
    id: string;
    participants: string[];
    lastMessageText?: string;
    lastMessageTimestamp?: Timestamp;
    otherParticipant: {
        id: string;
        name: string;
        avatar: string;
    };
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

function ChatInterface({ chatSession, adminId, adminName, onBack }: { chatSession: ChatSession, adminId: string, adminName: string, onBack?: () => void }) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollAreaEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const [isDeleting, startDeleteTransition] = useTransition();
    const isMobile = useIsMobile();
    const [previewImage, setPreviewImage] = useState<{url: string; name: string} | null>(null);
    const { db: adminDb } = getFirebaseServices('admin');


    useEffect(() => {
        if (!adminDb) return;
        const q = query(collection(adminDb, 'chats', chatSession.id, 'messages'), orderBy('timestamp', 'asc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs: ChatMessage[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
            setMessages(msgs);
        });
        return () => unsubscribe();
    }, [chatSession.id, adminDb]);

    useEffect(() => {
        setTimeout(() => scrollAreaEndRef.current?.scrollIntoView({ behavior: 'auto' }), 100);
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !adminDb) return;
        
        setIsSending(true);
        try {
            await addMessageToChat(chatSession.id, {
                text: newMessage,
                senderId: adminId,
                timestamp: Timestamp.now(),
            }, adminDb);
            setNewMessage('');
        } catch (error) {
            console.error("Erreur lors de l'envoi du message:", error);
        } finally {
            setIsSending(false);
        }
    };
    
    const handleSendFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !adminDb) return;

        setIsSending(true);
        try {
            const dataUri = await convertFileToDataUri(file);
            const result = await uploadChatAttachment(chatSession.id, dataUri, file.name);

            if (!result.success || !result.url) {
                throw new Error(result.error || "Échec du téléversement du fichier.");
            }

            await addMessageToChat(chatSession.id, {
                senderId: adminId,
                timestamp: Timestamp.now(),
                fileUrl: result.url,
                fileName: file.name,
                fileType: file.type,
            }, adminDb);

        } catch (error) {
            console.error("Erreur lors de l'envoi du fichier:", error);
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: (error as Error).message || "Impossible d'envoyer le fichier.",
            });
        } finally {
            setIsSending(false);
            if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        }
    };

    const handleDeleteMessage = (messageId?: string) => {
        if (!messageId) return;
        startDeleteTransition(async () => {
            const result = await deleteAdminMessageAction(chatSession.id, messageId);
            if (result.success) {
                 toast({ title: "Message supprimé." });
            } else {
                toast({ variant: 'destructive', title: 'Erreur', description: result.error || "Impossible de supprimer le message." });
            }
        });
    };

    const getInitials = (name: string) => (name || '').split(' ').map(n => n[0]).join('') || 'U';

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
                                          Télécharger
                                       </a>
                                    </Button>
                                    <DialogClose asChild>
                                        <Button variant="secondary">Fermer</Button>
                                    </DialogClose>
                                </div>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <div className="flex-shrink-0 border-b p-4">
                <div className="flex items-center gap-2">
                    {isMobile && onBack && (
                         <Button variant="ghost" size="icon" className="-ml-2 h-8 w-8 shrink-0" onClick={onBack}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <h3 className="text-lg font-semibold truncate">Conversation avec {chatSession.otherParticipant.name}</h3>
                </div>
            </div>

            <ScrollArea className="flex-1 min-h-0">
                <div className="p-4 space-y-4">
                    {messages.map((msg) => {
                        const isAdmin = msg.senderId === adminId;

                        if (msg.deletedForUser) {
                           return (
                             <div key={msg.id} className="flex justify-start">
                                <div className="text-sm italic text-muted-foreground p-2">
                                    [Message supprimé par l'utilisateur]
                                </div>
                            </div>
                           )
                        }

                        return (
                             <div key={msg.id} className={cn('group flex items-end gap-2', isAdmin ? 'justify-end' : 'justify-start')}>
                                {!isAdmin && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={chatSession.otherParticipant.avatar} />
                                        <AvatarFallback>{getInitials(chatSession.otherParticipant.name || 'U')}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn(
                                    'max-w-[85%] md:max-w-md rounded-lg px-3 py-2 text-sm break-words',
                                    isAdmin ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                )}>
                                    <div className={cn(msg.text ? 'mb-1' : '')}>
                                        {msg.fileUrl && msg.fileType?.startsWith('image/') ? (
                                            <button
                                                onClick={() => setPreviewImage({ url: msg.fileUrl!, name: msg.fileName || 'image.png' })}
                                                className="block relative w-48 h-48 rounded-md overflow-hidden cursor-pointer"
                                            >
                                                <Image src={msg.fileUrl!} alt={msg.fileName || 'Pièce jointe'} fill style={{objectFit: 'cover'}}/>
                                            </button>
                                        ) : msg.fileUrl ? (
                                            <a
                                                href={getCloudinaryDownloadUrl(msg.fileUrl)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={cn(
                                                    "flex items-center gap-2 p-2 rounded-md transition-colors",
                                                    isAdmin ? "bg-white/20 hover:bg-white/30" : "bg-black/5 hover:bg-black/10"
                                                )}
                                                >
                                                {msg.fileType === 'application/pdf' ? <FileText className="h-6 w-6 flex-shrink-0" /> : <FileIcon className="h-6 w-6 flex-shrink-0" />}
                                                <span className="font-medium truncate min-w-0">{msg.fileName || 'Fichier partagé'}</span>
                                            </a>
                                        ) : null}
                                    </div>
                                    {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                                    <p className={cn("text-xs mt-1 text-right", isAdmin ? "text-primary-foreground/70" : "text-muted-foreground/70")}>
                                        {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                {isAdmin && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>{getInitials(adminName)}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        )
                    })}
                </div>
                <div ref={scrollAreaEndRef} />
            </ScrollArea>
            <div className="p-4 border-t bg-background flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Répondez ici..."
                        disabled={isSending}
                    />
                    <input type="file" ref={fileInputRef} onChange={handleSendFile} className="hidden" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isSending}>
                        <Paperclip className="h-4 w-4" />
                        <span className="sr-only">Joindre un fichier</span>
                    </Button>
                    <Button type="submit" size="icon" disabled={isSending || !newMessage.trim()}>
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        <span className="sr-only">Envoyer</span>
                    </Button>
                </form>
            </div>
        </div>
    );
}

export function MessagingAdminClient() {
    const { user, userProfile } = useAdminAuth();
    const [chats, setChats] = useState<ChatSession[]>([]);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isResetting, startResetTransition] = useTransition();
    const { toast } = useToast();
    const isMobile = useIsMobile();
    
    const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const { db: adminDb } = getFirebaseServices('admin');

    const getInitials = (name: string) => (name || '').split(' ').map(n => n[0]).join('') || 'U';


    useEffect(() => {
        if (!user || !adminDb) return;
        
        const q = query(collection(adminDb, 'chats'));
        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const chatSessionsPromises = querySnapshot.docs.map(async (doc) => {
                const data = doc.data();
                const clientParticipantId = data.participants.find((p: string) => p !== ADVISOR_ID);
                
                let participantDetails = {
                    id: clientParticipantId || '',
                    name: 'Utilisateur Inconnu',
                    avatar: ''
                };

                if (clientParticipantId) {
                    const userDoc = await getUserFromFirestore(clientParticipantId, adminDb);
                    if (userDoc) {
                        participantDetails = {
                            id: userDoc.uid,
                            name: `${userDoc.firstName} ${userDoc.lastName}`,
                            avatar: userDoc.photoURL || ''
                        };
                    }
                }

                return {
                    id: doc.id,
                    participants: data.participants,
                    lastMessageText: data.lastMessageText,
                    lastMessageTimestamp: data.lastMessageTimestamp,
                    otherParticipant: participantDetails,
                };
            });

            const resolvedChats = await Promise.all(chatSessionsPromises);

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
    }, [user, adminDb]);

    const handleResetConversation = (chatId: string) => {
        startResetTransition(async () => {
            const result = await resetConversationAction(chatId);
            if (result.success) {
                toast({ title: 'Conversation réinitialisée', description: 'La conversation a été vidée de ses messages.' });
                if(selectedChatId === chatId) {
                    setSelectedChatId(null);
                }
            } else {
                 toast({ variant: 'destructive', title: 'Erreur', description: result.error || 'Impossible de réinitialiser la conversation.' });
            }
        });
    }

    const handleOpenNewChatDialog = async () => {
        setIsNewChatDialogOpen(true);
        if (allUsers.length > 0 || !adminDb) return;

        setIsLoadingUsers(true);
        try {
            const users = await getAllUsers(adminDb);
            const usersWithoutAdmin = users.filter(u => u.uid !== user?.uid);
            setAllUsers(usersWithoutAdmin);
        } catch (e) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les utilisateurs.' });
        } finally {
            setIsLoadingUsers(false);
        }
    };
    
    const handleSelectUserForNewChat = async (selectedUser: UserProfile) => {
        if (!user || !adminDb) return;
        try {
            const newChatId = await getOrCreateChatId(selectedUser.uid, ADVISOR_ID, adminDb);
            setSelectedChatId(newChatId);
            setIsNewChatDialogOpen(false);
        } catch (e) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de créer ou de trouver la session de chat.' });
        }
    }


    if (isLoading || !user || !userProfile) {
        return <Skeleton className="h-full w-full" />;
    }

    const selectedChat = selectedChatId ? chats.find(c => c.id === selectedChatId) : null;
    const adminName = `${userProfile.firstName} ${userProfile.lastName}`;
    
    const conversationList = (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0 space-y-4">
                 <CardTitle>Conversations</CardTitle>
                <Dialog open={isNewChatDialogOpen} onOpenChange={setIsNewChatDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full" onClick={handleOpenNewChatDialog}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nouvelle
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Démarrer une nouvelle conversation</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                            <ScrollArea className="h-72">
                            {isLoadingUsers ? <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin"/></div> : (
                                <ul className="space-y-1">
                                {allUsers.length > 0 ? allUsers.map(u => (
                                    <li key={u.uid}>
                                    <button onClick={() => handleSelectUserForNewChat(u)} className="w-full text-left p-2 hover:bg-muted rounded-md transition-colors">
                                        <p className="font-medium">{u.firstName} {u.lastName}</p>
                                        <p className="text-sm text-muted-foreground">{u.email}</p>
                                    </button>
                                    </li>
                                )) : <p className="text-muted-foreground text-center p-4">Aucun utilisateur à qui envoyer un message.</p>}
                                </ul>
                            )}
                            </ScrollArea>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <Separator />
            <ScrollArea className="flex-1 min-h-0">
                <div className="p-2">
                    {isLoading && <div className="p-6 space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>}
                    {!isLoading && chats.length === 0 && <p className="p-6 text-muted-foreground">Aucune conversation.</p>}
                     {chats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => setSelectedChatId(chat.id)}
                            className={cn(
                                "group w-full flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-muted/50 cursor-pointer", 
                                selectedChatId === chat.id && "bg-muted"
                            )}
                        >
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={chat.otherParticipant?.avatar} alt={chat.otherParticipant?.name} />
                                <AvatarFallback>{getInitials(chat.otherParticipant?.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <p className="font-semibold truncate">{chat.otherParticipant?.name || 'Utilisateur'}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                    {chat.lastMessageTimestamp ? formatDistanceToNow(chat.lastMessageTimestamp.toDate(), { addSuffix: true, locale: fr }) : 'Aucun message'}
                                </p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                    className={cn(
                                        buttonVariants({ variant: 'ghost', size: 'icon'}),
                                        "group-hover:opacity-100 transition-opacity opacity-0 h-8 w-8 shrink-0"
                                    )}
                                >
                                    <RefreshCw className="h-4 w-4 text-destructive" />
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Réinitialiser cette conversation ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Cette action est irréversible. Tous les messages de cette conversation seront définitivement supprimés. La conversation restera dans votre liste, vide.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleResetConversation(chat.id)} disabled={isResetting}>
                                        {isResetting ? <Loader2 className="h-4 w-4 animate-spin"/> : "Réinitialiser"}
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </Card>
    );
    
    const chatView = selectedChat ? (
        <Card className="h-full flex flex-col">
            <ChatInterface chatSession={selectedChat} adminId={user.uid} adminName={adminName} onBack={() => setSelectedChatId(null)} />
        </Card>
    ) : (
        <Card className="hidden md:flex flex-col items-center justify-center h-full text-center p-8 border-dashed">
            <MessageSquare className="h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">Sélectionnez une conversation</h3>
            <CardDescription className="mt-1">
                Choisissez une conversation dans la liste de gauche pour afficher les messages ou créez-en une nouvelle.
            </CardDescription>
        </Card>
    );

    if (isMobile) {
        return selectedChat ? chatView : conversationList;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
            <div className="md:col-span-1 xl:col-span-1 h-full">
                {conversationList}
            </div>
            <div className="md:col-span-2 xl:col-span-3 h-full">
                {chatView}
            </div>
        </div>
    );
}
