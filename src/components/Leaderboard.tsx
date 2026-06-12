import React, { useEffect, useState } from 'react';
import { Trophy, TrendingUp, Medal } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  username: string;
  avatarUrl: string;
  virtualBalanceUsd: number;
  roiPercent: number;
}

export default function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.leaderboard) {
          setUsers(data.leaderboard);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto h-full overflow-y-auto bg-[#EFEAE2] p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
            Hall of Fame
          </h1>
          <p className="text-gray-500 mt-2">Highest 7-Day ROI (Demo Trading)</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center">
           <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
           <span className="text-sm font-medium text-gray-700">Top 10 Traders Live</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
           <div className="p-12 flex justify-center">
             <div className="w-8 h-8 border-4 border-gray-200 border-t-yellow-500 rounded-full animate-spin" />
           </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-semibold text-center w-16">Rank</th>
                <th className="p-4 font-semibold">Trader</th>
                <th className="p-4 font-semibold text-right">Balance</th>
                <th className="p-4 font-semibold text-right">7D ROI</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-center">
                    {index === 0 ? <Medal className="w-6 h-6 text-yellow-500 mx-auto" /> 
                    : index === 1 ? <Medal className="w-6 h-6 text-gray-400 mx-auto" />
                    : index === 2 ? <Medal className="w-6 h-6 text-amber-600 mx-auto" />
                    : <span className="text-gray-400">#{index + 1}</span>}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <img src={user.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full bg-gray-200" />
                      <span className="font-semibold text-gray-900">{user.username}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right font-mono font-medium text-gray-800">
                    ${user.virtualBalanceUsd.toFixed(2)}
                  </td>
                  <td className="p-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                      ${user.roiPercent >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                    `}>
                      {user.roiPercent > 0 ? '+' : ''}{user.roiPercent.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                   <td colSpan={4} className="p-8 text-center text-gray-500">No active traders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
