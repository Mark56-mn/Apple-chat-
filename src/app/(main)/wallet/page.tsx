import React from 'react';
import PieWallet from '../../../components/PieWallet';

export default function WalletPage({ userId }: { userId: string }) {
  return (
    <div className="w-full h-full bg-[#131722] flex flex-col">
      <div className="flex-1 overflow-y-auto">
         <PieWallet userId={userId} />
      </div>
    </div>
  );
}
