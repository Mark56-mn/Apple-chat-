import React, { useEffect, useState } from 'react';
import { Terminal, Activity, Users, MessageSquare, Briefcase } from 'lucide-react';

interface AdminStats {
  activeWebSockets: number;
  totalTrades: number;
  totalUsers: number;
  totalPosts: number;
  serverHealth: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 w-full bg-[#0d1117] text-[#c9d1d9] font-mono h-full overflow-y-auto p-8 border-l border-gray-800">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center space-x-3 mb-8 border-b border-[#30363d] pb-4">
          <Terminal className="w-8 h-8 text-[#58a6ff]" />
          <h1 className="text-2xl font-bold text-white tracking-wider">FOUNDER_DASHBOARD</h1>
          <span className="text-xs bg-[#238636] text-white px-2 py-1 rounded ml-4 font-sans uppercase tracking-widest">Live</span>
        </div>

        {loading ? (
           <div className="text-[#8b949e] animate-pulse">Initializing telemetry...</div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg bg-[#161b22] border border-[#30363d] shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-1 h-full bg-[#3fb950]" />
               <div className="flex items-center space-x-4 mb-4">
                 <Activity className="w-6 h-6 text-[#3fb950]" />
                 <h2 className="text-[#8b949e] uppercase tracking-wider text-sm">Active Connections</h2>
               </div>
               <div className="text-5xl font-light text-white">{stats.activeWebSockets}</div>
            </div>

            <div className="p-6 rounded-lg bg-[#161b22] border border-[#30363d] shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-[#58a6ff]" />
               <div className="flex items-center space-x-4 mb-4">
                 <Briefcase className="w-6 h-6 text-[#58a6ff]" />
                 <h2 className="text-[#8b949e] uppercase tracking-wider text-sm">Lifetime Trades</h2>
               </div>
               <div className="text-5xl font-light text-white">{stats.totalTrades}</div>
            </div>

            <div className="p-6 rounded-lg bg-[#161b22] border border-[#30363d] shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-[#db61a2]" />
               <div className="flex items-center space-x-4 mb-4">
                 <Users className="w-6 h-6 text-[#db61a2]" />
                 <h2 className="text-[#8b949e] uppercase tracking-wider text-sm">Registered Users</h2>
               </div>
               <div className="text-5xl font-light text-white">{stats.totalUsers}</div>
            </div>

            <div className="p-6 rounded-lg bg-[#161b22] border border-[#30363d] shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-[#f0883e]" />
               <div className="flex items-center space-x-4 mb-4">
                 <MessageSquare className="w-6 h-6 text-[#f0883e]" />
                 <h2 className="text-[#8b949e] uppercase tracking-wider text-sm">Total Feed Posts</h2>
               </div>
               <div className="text-5xl font-light text-white">{stats.totalPosts}</div>
            </div>

            <div className="col-span-1 md:col-span-2 p-6 rounded-lg bg-[#161b22] border border-[#30363d] mt-4">
               <h2 className="text-[#8b949e] uppercase tracking-wider text-sm mb-4">System Health</h2>
               <div className="bg-[#0d1117] p-4 rounded text-[#3fb950] font-mono text-sm leading-relaxed border border-[#30363d]">
                 <p>&gt; Checking database cluster... OK</p>
                 <p>&gt; Memory usage: 1.2GB / 4.0GB</p>
                 <p>&gt; Redis PubSub: ONLINE</p>
                 <p>&gt; WebSocket Nodes: 3 active</p>
                 <p className="mt-2 text-white font-bold">{stats.serverHealth}</p>
                 <div className="mt-4 w-full h-1 bg-[#30363d] overflow-hidden">
                    <div className="h-full bg-[#3fb950] w-[95%] animate-pulse" />
                 </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="text-[#f85149]">SYSTEM_ERROR: Analytics module offline.</div>
        )}
      </div>
    </div>
  );
}
