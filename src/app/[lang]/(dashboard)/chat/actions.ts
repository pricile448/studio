'use server';

import { addMessageToChat, getOrCreateChatId } from '@/lib/firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { z } from 'zod';

const sendMessageSchema = z.object({
  text: z.string().min(1),
  userId: z.string(),
  advisorId: z.string(),
});

export async function sendMessage(input: z.infer<typeof sendMessageSchema>) {
  const validation = sendMessageSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: 'Invalid input' };
  }
  
  const { text, userId, advisorId } = validation.data;
  
  try {
    const chatId = await getOrCreateChatId(userId, advisorId);
    await addMessageToChat(chatId, {
      text,
      senderId: userId,
      timestamp: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: (error as Error).message };
  }
}
