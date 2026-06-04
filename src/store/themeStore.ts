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
      isDarkMode: true, // Default to dark mode
      setIsDarkMode: (value) => set({ isDarkMode: value }),
    }),
    {
      name: 'fitforge-theme-store',
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);
