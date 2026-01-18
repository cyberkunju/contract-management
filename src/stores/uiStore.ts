/**
 * UI State Store
 * Manages global UI state like theme
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface UIState {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            theme: 'light',
            toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
            setTheme: (theme) => set({ theme }),
        }),
        {
            name: 'ui-settings',
        }
    )
);
