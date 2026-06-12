import { create } from 'zustand';

export interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
}

interface UserState {
  piePoints: number;
  missions: Mission[];
  addPiePoints: (amount: number) => void;
  completeMission: (id: string) => void;
}

const initialMissions: Mission[] = [
  {
    id: "m1",
    title: "High Slippage Trader",
    description: "Execute a trade with > 1.5% slippage on the Pie Wallet.",
    reward: 50,
    completed: false
  },
  {
    id: "m2",
    title: "Social Butterfly",
    description: "Send 5 messages in any Chat Room today.",
    reward: 20,
    completed: false
  },
  {
    id: "m3",
    title: "Viral Creator",
    description: "Post a new update in the Social Feed.",
    reward: 100,
    completed: false
  }
];

export const useUserStore = create<UserState>((set) => ({
  piePoints: 120,
  missions: initialMissions,
  addPiePoints: (amount) => set((state) => ({ piePoints: state.piePoints + amount })),
  completeMission: (id) => set((state) => {
    const nextMissions = [...state.missions];
    const idx = nextMissions.findIndex(m => m.id === id);
    if (idx !== -1 && !nextMissions[idx].completed) {
      nextMissions[idx] = { ...nextMissions[idx], completed: true };
      return { 
        missions: nextMissions,
        piePoints: state.piePoints + nextMissions[idx].reward
      };
    }
    return state;
  })
}));
