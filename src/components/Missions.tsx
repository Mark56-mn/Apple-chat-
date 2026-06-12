import React, { useEffect, useRef } from 'react';
import { Target, CheckCircle2, Circle, Gift, Trophy } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import confetti from 'canvas-confetti';

export default function Missions() {
  const { missions, piePoints: points, completeMission } = useUserStore();
  const prevPoints = useRef(points);

  const tiers = [
    { name: 'Bronze', threshold: 0 },
    { name: 'Silver', threshold: 200 },
    { name: 'Gold', threshold: 500 },
    { name: 'Diamond', threshold: 1000 },
  ];
  
  let currentTier = tiers[0];
  let nextTier = tiers[1];
  
  for (let i = 0; i < tiers.length; i++) {
    if (points >= tiers[i].threshold) {
      currentTier = tiers[i];
      nextTier = tiers[i + 1] || tiers[i];
    }
  }

  const progress = nextTier.threshold > currentTier.threshold 
    ? ((points - currentTier.threshold) / (nextTier.threshold - currentTier.threshold)) * 100
    : 100;

  useEffect(() => {
    // Check if points crossed a threshold
    for (const tier of tiers) {
      if (prevPoints.current < tier.threshold && points >= tier.threshold) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.3 }, // slightly higher on screen
          colors: ['#a855f7', '#6366f1', '#eab308']
        });
        break; // Only trigger once if they somehow skip multiple tiers
      }
    }
    prevPoints.current = points;
  }, [points, tiers]);

  const handleCompleteMission = (id: string, event: React.MouseEvent) => {
    completeMission(id);
    
    // Trigger localized confetti at the click location for mission completion
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x, y },
      colors: ['#a855f7', '#6366f1', '#eab308'] // purple, indigo, yellow
    });
  };

  return (
    <div className="flex-1 w-full bg-[#f9fafb] text-gray-900 h-full overflow-y-auto p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        {/* Tier Progress Dashboard Widget */}
        <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-between border-b border-purple-100">
           <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Trophy className={`w-8 h-8 ${currentTier.name === 'Bronze' ? 'text-orange-400' : currentTier.name === 'Silver' ? 'text-gray-400' : currentTier.name === 'Gold' ? 'text-yellow-400' : 'text-blue-400'}`} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{currentTier.name} Tier</h3>
                <p className="text-gray-500 text-sm">Target: {nextTier.name}</p>
              </div>
           </div>
           
           <div className="flex-1 max-w-[250px] ml-8">
              <div className="flex justify-between text-xs font-bold text-gray-600 mb-2">
                 <span>{points} pts</span>
                 <span>{nextTier.threshold} pts</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(progress, 100)}%` }}></div>
              </div>
              <div className="text-[10px] text-gray-500 mt-2 text-right font-medium">
                {nextTier.threshold > currentTier.threshold ? `${nextTier.threshold - points} pts to level up` : 'Max Tier Reached!'}
              </div>
           </div>
        </div>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Daily Missions</h1>
              <p className="text-sm text-purple-100">Complete tasks to earn PiePoints</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-sm text-purple-100 font-medium">My Balance</span>
            <div className="flex items-center space-x-2 bg-white/20 px-3 py-1.5 rounded-full mt-1 backdrop-blur-sm">
               <Gift className="w-4 h-4 text-yellow-300" />
               <span className="font-bold text-lg">{points} <span className="text-xs font-normal opacity-80 uppercase tracking-widest">pts</span></span>
            </div>
          </div>
        </div>

        {/* Missions List */}
        <div className="p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Today's Challenges</h2>
          
          <div className="space-y-4">
            {missions.map((mission) => (
              <div 
                key={mission.id} 
                className={`p-4 rounded-xl border-2 transition-all ${
                  mission.completed 
                  ? 'border-green-100 bg-green-50/50' 
                  : 'border-gray-100 bg-white hover:border-purple-200'
                } flex items-center justify-between`}
              >
                <div className="flex items-start justify-between w-full pr-4">
                  <div>
                    <h3 className={`font-bold text-lg flex items-center ${mission.completed ? 'text-green-800 line-through opacity-70' : 'text-gray-900'}`}>
                      {mission.title}
                    </h3>
                    <p className={`text-sm mt-1 ${mission.completed ? 'text-green-600/70' : 'text-gray-500'}`}>
                      {mission.description}
                    </p>
                    
                    <div className="mt-3 flex items-center space-x-2">
                       <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                         mission.completed ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                       }`}>
                         +{mission.reward} pts
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {mission.completed ? (
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  ) : (
                    <button 
                      onClick={(e) => handleCompleteMission(mission.id, e)}
                      className="group p-2"
                      title="Simulate Completion"
                    >
                      <Circle className="w-8 h-8 text-gray-300 group-hover:text-purple-400 transition-colors" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
