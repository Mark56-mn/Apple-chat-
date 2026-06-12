import { create } from 'zustand';

export type NavTab = 'feed' | 'chat' | 'wallet' | 'profile';

interface NavState {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const useNavStore = create<NavState>((set) => ({
  activeTab: 'feed',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
