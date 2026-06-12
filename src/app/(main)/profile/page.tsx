import React, { useState } from 'react';
import { useUserStore } from '../../../store/userStore';
import { Trophy, Gift, Share2, LogOut, Check } from 'lucide-react';

export default function ProfilePage({ userId }: { userId: string }) {
  const { piePoints, missions } = useUserStore();
  const completedMissions = missions.filter(m => m.completed).length;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://applechat.app/ref/${userId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-4 safe-area-top shadow-sm flex items-center justify-between">
        <div className="w-8" /> {/* Placeholder for balance */}
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Profile</h1>
        <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors" title="Logout">
          <LogOut className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg mb-4">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">@{userId}</h2>
          <p className="text-sm text-gray-500 mb-6">Apple Chat Member</p>
          
          <div className="flex items-center space-x-12 w-full justify-center border-t border-gray-100 pt-6">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#FF6B35] to-orange-400">
                {piePoints}
              </span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Pie Points</span>
            </div>
            
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-gray-900">
                {completedMissions}
              </span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Missions</span>
            </div>
          </div>
        </div>

        {/* Referral Section */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-md text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-2">
              <Gift className="w-5 h-5 text-indigo-200" />
              <h3 className="text-lg font-bold">Invite Friends</h3>
            </div>
            <p className="text-indigo-100 text-sm mb-4">
              Earn 500 Pie Points for every friend that executes their first trade on the Pie Wallet.
            </p>
            <button 
              onClick={handleCopy}
              className="w-full bg-white text-indigo-600 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-indigo-50 transition-colors"
            >
              {copied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Referral Link'}</span>
            </button>
          </div>
        </div>
        
        {/* Logout Button (Secondary) */}
        <button 
          onClick={handleLogout}
          className="w-full py-4 rounded-2xl border border-red-100 text-red-500 font-bold bg-white shadow-sm flex items-center justify-center space-x-2 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>

        <div className="text-center text-xs text-gray-400 mt-4 pb-4">
          Apple Chat v2.0 • Data is saved locally & synced to MongoDB.
        </div>
      </div>
    </div>
  );
}
