import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { UIStore } from '../types';

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        darkMode: true, // Default to dark mode for True Pure Black theme
        currentView: 'all',

        toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
        
        setCurrentView: (view: UIStore['currentView']) => set({ currentView: view }),
        
        toggleDarkMode: () => set(state => ({ darkMode: !state.darkMode })),
      }),
      {
        name: 'ui-store',
        partialize: (state) => ({
          sidebarOpen: state.sidebarOpen,
          darkMode: state.darkMode,
          currentView: state.currentView,
        }),
      }
    ),
    {
      name: 'ui-store',
    }
  )
);
