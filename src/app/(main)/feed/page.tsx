import React from 'react';
import Feed from '../../../components/Feed';

export default function FeedPage({ userId }: { userId: string }) {
  return (
    <div className="w-full h-full bg-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-4 safe-area-top">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Feed</h1>
      </div>
      <div className="h-[calc(100%-60px)]">
        <Feed userId={userId} />
      </div>
    </div>
  );
}
