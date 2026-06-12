import React, { useState, useRef, useEffect } from 'react';
import { Send, Check, CheckCheck, MoreVertical, Search, Phone, Video } from 'lucide-react';
import { format } from 'date-fns';
import { useChatStore } from '../store/chatStore';
import { useChat } from '../hooks/useChat';
import { ChatRoom, ChatMessage } from '../types/chat';

interface ChatWindowProps {
  room: ChatRoom;
  userId: string;
}

export default function ChatWindow({ room, userId }: ChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, typingUsers } = useChatStore();
  const { sendMessage, sendTyping } = useChat(userId);

  const roomMessages = messages[room.id] || [];
  const roomTypers = typingUsers[room.id] || [];
  const isOtherTyping = roomTypers.filter(id => id !== userId).length > 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [roomMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    sendMessage(room.id, inputText.trim());
    setInputText('');
    sendTyping(room.id, false);
  };

  let typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    
    sendTyping(room.id, true);
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(room.id, false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#EFEAE2] flex-1">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#f0f2f5] border-b border-gray-200">
        <div className="flex items-center space-x-3 cursor-pointer">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${room.id}`} alt="avatar" />
          </div>
          <div>
            <h2 className="text-gray-900 font-medium">{room.name}</h2>
            <p className="text-xs text-gray-500">
              {isOtherTyping ? 'typing...' : 'click here for contact info'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-gray-500">
          <Video className="w-5 h-5 cursor-pointer hover:text-gray-700" />
          <Phone className="w-5 h-5 cursor-pointer hover:text-gray-700" />
          <Search className="w-5 h-5 cursor-pointer hover:text-gray-700" />
          <MoreVertical className="w-5 h-5 cursor-pointer hover:text-gray-700" />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#EFEAE2]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}>
        {roomMessages.map((msg: ChatMessage) => {
          const isMe = msg.senderId === userId;
          
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[65%] px-3 py-2 rounded-lg relative shadow-sm text-sm
                  ${isMe ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-none' : 'bg-white text-gray-900 rounded-tl-none'}
                `}
              >
                {/* Tail for bubbles */}
                <div 
                  className={`absolute top-0 w-3 h-3 
                  ${isMe ? '-right-2 bg-[#d9fdd3] rounded-bl-full' : '-left-2 bg-white rounded-br-full'}`}
                  style={{ clipPath: isMe ? 'polygon(0 0, 100% 0, 0 100%)' : 'polygon(0 0, 100% 0, 100% 100%)' }}
                />
                
                <p className="break-words mr-8 pb-3">{msg.content}</p>
                <div className="absolute right-2 bottom-1 flex items-center space-x-1 text-[10px] text-gray-500">
                  <span>{format(new Date(msg.timestamp), 'HH:mm')}</span>
                  {isMe && (
                    <span className="ml-1">
                      {msg.status === 'pending' && <Check className="w-3 h-3 text-gray-400" />}
                      {msg.status === 'sent' && !msg.isRead && <Check className="w-3 h-3 text-gray-400" />}
                      {msg.status === 'sent' && msg.isRead && <CheckCheck className="w-3 h-3 text-blue-500" />}
                      {msg.status === 'error' && <span className="text-red-500">!</span>}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {isOtherTyping && (
           <div className="flex justify-start">
             <div className="bg-white px-4 py-2 rounded-lg rounded-tl-none shadow-sm flex items-center space-x-1">
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#f0f2f5] p-3 flex items-center space-x-3">
        <button className="text-gray-500 hover:text-gray-700">
          {/* Default emoji icon placeholder */}
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M12 7a2 2 0 1 0-.001-3.999A2 2 0 0 0 12 7zm0 2C6.486 9 2 13.486 2 19h20c0-5.514-4.486-10-10-10zm0 3c1.66 0 3.14.478 4.35 1.29l-1.04 1.76A5.969 5.969 0 0 0 12 14c-1.35 0-2.61.436-3.64 1.18l-1.07-1.72A7.957 7.957 0 0 1 12 12z"></path>
          </svg>
        </button>
        <button className="text-gray-500 hover:text-gray-700">
           <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M1.816 15.556v.002c0 1.502.584 2.912 1.646 3.972s2.472 1.647 3.974 1.647a5.58 5.58 0 0 0 3.972-1.645l9.547-9.548c.769-.768 1.147-1.767 1.058-2.817-.079-.968-.548-1.927-1.319-2.698-1.594-1.592-4.068-1.711-5.517-.262l-7.916 7.915c-.881.881-.792 2.25.214 3.261.959.958 2.423 1.053 3.263.215l5.511-5.512c.28-.28.267-.722.053-.936l-.244-.244c-.191-.191-.567-.349-.957.04l-5.506 5.506c-.18.18-.635.127-.976-.214-.098-.097-.576-.613-.213-.973l7.915-7.917c.818-.817 2.267-.699 3.23.262.5.501.802 1.1.849 1.685.051.573-.156 1.111-.589 1.543l-9.547 9.549a3.97 3.97 0 0 1-2.829 1.171 3.975 3.975 0 0 1-2.83-1.173 3.973 3.973 0 0 1-1.172-2.828c0-1.071.415-2.076 1.172-2.83l7.209-7.211c.157-.157.264-.579.028-.814L11.5 4.36a.572.572 0 0 0-.834.018l-7.205 7.207a5.577 5.577 0 0 0-1.645 3.971z"></path>
           </svg>
        </button>
        <form onSubmit={handleSend} className="flex-1">
          <input
            type="text"
            value={inputText}
            onChange={handleTyping}
            placeholder="Type a message"
            className="w-full bg-white rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-gray-300 shadow-sm"
          />
        </form>
        {inputText.trim() ? (
           <button onClick={handleSend} className="text-gray-500 hover:text-green-500 transition">
             <Send className="w-5 h-5 ml-2" />
           </button>
        ) : (
           <button className="text-gray-500 hover:text-gray-700">
             <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
               <path d="M11.999 14.942c2.001 0 3.531-1.53 3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531S8.469 2.349 8.469 4.35v7.061c0 2.001 1.53 3.531 3.53 3.531zm6.238-3.53c0 3.531-2.942 6.002-6.237 6.002s-6.237-2.471-6.237-6.002H3.761c0 4.001 3.178 7.297 7.061 7.885v3.884h2.354v-3.884c3.884-.588 7.061-3.884 7.061-7.885h-2z"></path>
             </svg>
           </button>
        )}
      </div>
    </div>
  );
}
