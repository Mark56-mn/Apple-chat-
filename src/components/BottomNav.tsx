import React from 'react';
import { Home, MessageCircle, Wallet, User } from 'lucide-react';
import { useNavStore } from '../store/navStore';

export default function BottomNav() {
  const { activeTab, setActiveTab } = useNavStore();

  const tabs = [
    { id: 'feed', icon: Home, label: 'Feed' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'wallet', icon: Wallet, label: 'Wallet' },
    { id: 'profile', icon: User, label: 'Profile' }
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 max-w-2xl mx-auto px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex flex-col items-center justify-center w-16 h-full transition-colors duration-200 group"
            >
              <div className={`p-1.5 rounded-full transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                <Icon 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={`w-6 h-6 ${isActive ? 'text-[#FF6B35]' : 'text-gray-400 group-hover:text-gray-600'}`}
                />
              </div>
              <span className={`text-[10px] sm:text-xs mt-1 transition-all duration-200 ${isActive ? 'font-semibold text-[#FF6B35]' : 'font-medium text-gray-400 group-hover:text-gray-600'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
