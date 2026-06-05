import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '../utils/mmkvStorage';
import { TabName, DEFAULT_PRIMARY } from '@/constants/tabs';

interface TabLayoutState {
  primaryTabs: TabName[];
  setPrimaryTabs: (tabs: TabName[]) => void;
}

export const useTabLayoutStore = create<TabLayoutState>()(
  persist(
    (set) => ({
      primaryTabs: [...DEFAULT_PRIMARY],
      setPrimaryTabs: (tabs) => set({ primaryTabs: tabs }),
    }),
    {
      name: 'tab-layout-v1',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
