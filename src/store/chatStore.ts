import { create } from 'zustand';
import { ChatMessage, ChatRoom } from '../types/chat';

interface ChatState {
  activeRoomId: string | null;
  rooms: ChatRoom[];
  messages: Record<string, ChatMessage[]>;
  typingUsers: Record<string, string[]>; // roomId -> userIds
  setActiveRoom: (roomId: string) => void;
  setRooms: (rooms: ChatRoom[]) => void;
  addMessage: (roomId: string, message: ChatMessage) => void;
  updateMessageStatus: (roomId: string, messageId: string, status: ChatMessage['status']) => void;
  setTyping: (roomId: string, userId: string, isTyping: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeRoomId: null,
  rooms: [],
  messages: {},
  typingUsers: {},

  setActiveRoom: (roomId) => set({ activeRoomId: roomId }),
  
  setRooms: (rooms) => set({ rooms }),
  
  addMessage: (roomId, message) => set((state) => ({
    messages: {
      ...state.messages,
      [roomId]: [...(state.messages[roomId] || []), message]
    }
  })),

  updateMessageStatus: (roomId, messageId, status) => set((state) => {
    const spaceMessages = state.messages[roomId] || [];
    return {
      messages: {
        ...state.messages,
        [roomId]: spaceMessages.map((msg) => 
          msg.id === messageId ? { ...msg, status } : msg
        )
      }
    };
  }),

  setTyping: (roomId, userId, isTyping) => set((state) => {
    const currentTyping = state.typingUsers[roomId] || [];
    const newTyping = isTyping
      ? currentTyping.includes(userId) ? currentTyping : [...currentTyping, userId]
      : currentTyping.filter(id => id !== userId);
      
    return {
      typingUsers: {
        ...state.typingUsers,
        [roomId]: newTyping
      }
    };
  })
}));
