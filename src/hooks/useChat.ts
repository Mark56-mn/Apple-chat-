import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useChatStore } from '../store/chatStore';
import { ChatMessage } from '../types/chat';

export function useChat(userId: string) {
  const socketRef = useRef<Socket | null>(null);
  const { 
    addMessage, 
    updateMessageStatus, 
    setTyping, 
    activeRoomId 
  } = useChatStore();

  useEffect(() => {
    // Initialize socket connection
    const socket = io({
      query: { userId },
      path: '/socket.io/',
      transports: ['websocket', 'polling'] // Try websocket first
    });
    
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to chat server');
    });

    socket.on('receive_message', (message: ChatMessage) => {
      addMessage(message.chatRoomId, { ...message, status: 'sent' });
    });

    socket.on('message_sent', ({ tempId, message }: { tempId: string, message: ChatMessage }) => {
      updateMessageStatus(message.chatRoomId, tempId, 'sent');
    });

    socket.on('message_error', ({ tempId, roomId }: { tempId: string, roomId: string }) => {
      updateMessageStatus(roomId, tempId, 'error');
    });

    socket.on('typing_indicator', ({ roomId, userId, isTyping }: { roomId: string, userId: string, isTyping: boolean }) => {
      setTyping(roomId, userId, isTyping);
    });

    socket.on('read_receipt', ({ roomId, messageIds }: { roomId: string, messageIds: string[] }) => {
      // Logic to update read receipts in the store
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, addMessage, updateMessageStatus, setTyping]);

  const joinRoom = useCallback((roomId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join_room', roomId);
    }
  }, []);

  const sendMessage = useCallback((roomId: string, content: string) => {
    const tempId = `temp-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: tempId,
      chatRoomId: roomId,
      senderId: userId,
      content,
      type: 'text',
      isRead: false,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    // Optimistic UI update
    addMessage(roomId, newMsg);

    if (socketRef.current) {
      socketRef.current.emit('send_message', { tempId, message: newMsg });
    }
  }, [userId, addMessage]);

  const sendTyping = useCallback((roomId: string, isTyping: boolean) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', { roomId, isTyping });
    }
  }, []);

  return {
    sendMessage,
    sendTyping,
    joinRoom
  };
}
