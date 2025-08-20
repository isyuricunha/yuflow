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
        selectedTasks: new Set<number>(),
        bulkMode: false,
        sortBy: null,

        setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
        setDarkMode: (dark: boolean) => set({ darkMode: dark }),
        setCurrentView: (view: UIStore['currentView']) => set({ currentView: view }),
        toggleTaskSelection: (taskId: number) => set(state => {
          const selectedTasks = new Set(state.selectedTasks);
          if (selectedTasks.has(taskId)) {
            selectedTasks.delete(taskId);
          } else {
            selectedTasks.add(taskId);
          }
          return { selectedTasks };
        }),
        selectAllTasks: (taskIds: number[]) => set({ selectedTasks: new Set(taskIds) }),
        clearSelection: () => set({ selectedTasks: new Set() }),
        setBulkMode: (enabled: boolean) => set(state => ({
          bulkMode: enabled,
          selectedTasks: enabled ? state.selectedTasks : new Set<number>()
        })),
        setSortBy: (sortBy: UIStore['sortBy']) => set({ sortBy }),
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
