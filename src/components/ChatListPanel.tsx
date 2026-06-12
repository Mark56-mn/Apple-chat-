import React from 'react';
import { Search } from 'lucide-react';
import { ChatRoom } from '../types/chat';

interface ChatListPanelProps {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
}

export default function ChatListPanel({ rooms, activeRoomId, onSelectRoom }: ChatListPanelProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
         <h2 className="text-xl font-bold text-gray-900">Chats</h2>
      </div>

      {/* Search */}
      <div className="bg-white p-3 border-b border-gray-200">
        <div className="bg-[#f0f2f5] rounded-xl flex items-center px-4 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00a884]/50 shadow-sm transition-all shadow-inner">
          <Search className="w-4 h-4 text-gray-500 mr-2" />
          <input 
            type="text" 
            placeholder="Search or start new chat" 
            className="bg-transparent border-none outline-none w-full text-sm text-gray-800 placeholder-gray-500"
          />
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto bg-white py-2">
        {rooms.map((room) => (
          <div 
            key={room.id}
            onClick={() => onSelectRoom(room.id)}
            className={`flex items-center px-4 py-3 cursor-pointer transition ${
              activeRoomId === room.id ? 'bg-[#f0f2f5]' : 'hover:bg-gray-50'
            }`}
          >
            {/* Avatar */}
            <div className="w-12 h-12 bg-gradient-to-tr from-gray-200 to-gray-300 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-gray-600 shadow-sm">
              {room.name.charAt(0)}
            </div>
            
            {/* Context */}
            <div className="ml-4 flex-1 border-b border-gray-100 pb-3 h-full flex flex-col justify-center">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-gray-900 font-medium">{room.name}</h3>
                <span className="text-xs text-gray-500">10:42 AM</span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500 truncate max-w-[190px]">
                  {/* Mock latest message text */}
                  Hey, did you check the charts today?
                </p>
                {room.unreadCount > 0 && (
                  <span className="bg-[#00a884] text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {room.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
