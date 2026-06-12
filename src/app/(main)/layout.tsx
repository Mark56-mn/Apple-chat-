import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import BottomNav from '../../components/BottomNav';
import SplashScreen from '../../components/SplashScreen';
import { useNavStore } from '../../store/navStore';
import FeedPage from './feed/page';
import ChatPage from './chat/page';
import WalletPage from './wallet/page';
import ProfilePage from './profile/page';

interface MainLayoutProps {
  userId: string;
}

export default function MainLayout({ userId }: MainLayoutProps) {
  const [showSplash, setShowSplash] = useState(true);
  const { activeTab } = useNavStore();

  useEffect(() => {
    // Only show splash screen once per session
    const hasSeenSplash = sessionStorage.getItem("apple_chat_splash_new");
    if (hasSeenSplash) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem("apple_chat_splash_new", "true");
  };

  return (
    <div className="relative min-h-screen w-full bg-white text-gray-900 font-sans sm:bg-gray-100 flex justify-center">
      <AnimatePresence mode="wait">
        {showSplash && <SplashScreen finishLoading={handleSplashComplete} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full max-w-[640px] bg-white h-screen flex flex-col relative shadow-xl overflow-hidden"
      >
        <main className="flex-1 w-full h-full pb-20 overflow-y-auto">
          {activeTab === 'feed' && <FeedPage userId={userId} />}
          {activeTab === 'chat' && <ChatPage userId={userId} />}
          {activeTab === 'wallet' && <WalletPage userId={userId} />}
          {activeTab === 'profile' && <ProfilePage userId={userId} />}
        </main>
        
        <BottomNav />
      </motion.div>
    </div>
  );
}
