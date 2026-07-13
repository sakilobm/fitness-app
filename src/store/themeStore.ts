import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '../utils/mmkvStorage';

interface ThemeState {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: false, // Default to light mode
      setIsDarkMode: (value) => set({ isDarkMode: value }),
    }),
    {
      name: 'vividly-theme-store',
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);
