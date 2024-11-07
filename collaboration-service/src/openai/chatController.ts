import { ChatModel, MessageType } from '../models/chat';

export async function getMessagesInChat(chatId: string) {
    try {
        // Find the chat by its _id
        const chat = await ChatModel.findById(chatId);
        if (!chat) {
            throw new Error('Chat not found');
        }
    
        const messages = chat.messages;
    
        return messages; // Return the found messages
    } catch (error : any) {
        console.error('Error:', error.message);
        throw error;
    }
}