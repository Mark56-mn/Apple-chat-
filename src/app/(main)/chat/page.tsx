import React, { useEffect } from 'react';
import { useChatStore } from '../../../store/chatStore';
import ChatListPanel from '../../../components/ChatListPanel';
import ChatWindow from '../../../components/ChatWindow';

export default function ChatPage({ userId }: { userId: string }) {
  const { rooms, activeRoomId, setActiveRoom, setRooms } = useChatStore();

  // Load mock data if no rooms exist (carry over from AppLayout)
  useEffect(() => {
    if (rooms.length === 0) {
      setRooms([
        {
          id: 'room_1',
          name: 'Team Alpha',
          participants: [userId, 'user_2'],
          unreadCount: 2,
        },
        {
          id: 'room_2',
          name: 'Jane Doe',
          participants: [userId, 'user_3'],
          unreadCount: 0,
        }
      ]);
    }
  }, [rooms, setRooms, userId]);

  const activeRoom = rooms.find(r => r.id === activeRoomId);

  // If a room is selected, show the ChatWindow covering the screen.
  if (activeRoom) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        {/* We need a simple back button header wrapper here theoretically, 
            but ChatWindow has its own header. Usually ChatWindow needs a way back.
            Let's add a back button inside the ChatWindow internally or wrap it here.
            Looking at ChatWindow, we could just add a back button by modifying it,
            but for now we'll just intercept. Let's pass a back handler? 
            Since ChatWindow doesn't take an onClose prop in the old version, we'll
            add a floating back button here. */}
        <div className="absolute top-4 left-4 z-50 p-2 bg-white/80 backdrop-blur rounded-full shadow-sm" onClick={() => setActiveRoom(null)}>
           <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </div>
        <ChatWindow room={activeRoom} userId={userId} />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-4 safe-area-top">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Messages</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatListPanel 
          rooms={rooms}
          activeRoomId={activeRoomId} 
          onSelectRoom={(id) => setActiveRoom(id)}
        />
      </div>
    </div>
  );
}
