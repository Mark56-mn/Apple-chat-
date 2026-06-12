export type MessageType = 'text' | 'image' | 'system';

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId?: string;
  chatRoomId: string;
  content: string;
  type: MessageType;
  isRead: boolean;
  timestamp: string;
  status: 'pending' | 'sent' | 'error';
}

export interface ChatRoom {
  id: string;
  name: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}

export interface UserStatus {
  userId: string;
  isOnline: boolean;
  lastSeen?: string;
}
