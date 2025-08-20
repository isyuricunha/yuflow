import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { TaskStore, CreateTaskInput, UpdateTaskInput, CreateCategoryInput, TaskFilters } from '../types';
import { databaseService } from '../services/database';

export const useTaskStore = create<TaskStore>()(
  devtools(
    (set, get) => ({
      tasks: [],
      categories: [],
      tags: [],
      filters: {},
      loading: false,
      error: null,

      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),

      // Task operations
      loadTasks: async () => {
        try {
          set({ loading: true, error: null });
          const adapter = await databaseService.getAdapter();
          const tasks = await adapter.getTasks(get().filters);
          set({ tasks, loading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load tasks',
            loading: false 
          });
        }
      },

      addTask: async (taskInput: CreateTaskInput) => {
        try {
          set({ loading: true, error: null });
          const adapter = await databaseService.getAdapter();
          const newTask = await adapter.createTask(taskInput);
          
          set(state => ({
            tasks: [newTask, ...state.tasks],
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create task',
            loading: false 
          });
        }
      },

      updateTask: async (taskUpdate: UpdateTaskInput) => {
        try {
          set({ loading: true, error: null });
          const adapter = await databaseService.getAdapter();
          const updatedTask = await adapter.updateTask(taskUpdate);
          
          set(state => ({
            tasks: state.tasks.map(task => 
              task.id === updatedTask.id ? updatedTask : task
            ),
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update task',
            loading: false 
          });
        }
      },

      deleteTask: async (id: number) => {
        try {
          set({ loading: true, error: null });
          const adapter = await databaseService.getAdapter();
          await adapter.deleteTask(id);
          
          set(state => ({
            tasks: state.tasks.filter(task => task.id !== id),
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete task',
            loading: false 
          });
        }
      },

      toggleTask: async (id: number) => {
        const task = get().tasks.find(t => t.id === id);
        if (!task) return;

        await get().updateTask({
          id,
          completed: !task.completed
        });
      },

      // Category operations
      loadCategories: async () => {
        try {
          set({ loading: true, error: null });
          const adapter = await databaseService.getAdapter();
          const categories = await adapter.getCategories();
          set({ categories, loading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load categories',
            loading: false 
          });
        }
      },

      addCategory: async (categoryInput: CreateCategoryInput) => {
        try {
          set({ loading: true, error: null });
          const adapter = await databaseService.getAdapter();
          const newCategory = await adapter.createCategory(categoryInput);
          
          set(state => ({
            categories: [...state.categories, newCategory],
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create category',
            loading: false 
          });
        }
      },

      updateCategory: async (id: number, updates: Partial<CreateCategoryInput>) => {
        try {
          set({ loading: true, error: null });
          const adapter = await databaseService.getAdapter();
          const updatedCategory = await adapter.updateCategory(id, updates);
          
          set(state => ({
            categories: state.categories.map(category => 
              category.id === updatedCategory.id ? updatedCategory : category
            ),
            loading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update category',
            loading: false 
          });
        }
      },

      deleteCategory: async (id: number) => {
        try {
          set({ loading: true, error: null });
          const adapter = await databaseService.getAdapter();
          await adapter.deleteCategory(id);
          
          set(state => ({
            categories: state.categories.filter(category => category.id !== id),
            loading: false
          }));
          
          // Reload tasks to reflect category removal
          await get().loadTasks();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete category',
            loading: false 
          });
        }
      },

      // Filter operations
      setFilters: (filters: Partial<TaskFilters>) => {
        set(state => ({ 
          filters: { ...state.filters, ...filters } 
        }));
        // Automatically reload tasks with new filters
        get().loadTasks();
      },

      // Sorting operations
      sortTasksByPriority: () => {
        set(state => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const sortedTasks = [...state.tasks].sort((a, b) => {
            const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
            const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
            return bPriority - aPriority; // High to low
          });
          return { tasks: sortedTasks };
        });
      },

      sortTasksByDueDate: () => {
        set(state => {
          const sortedTasks = [...state.tasks].sort((a, b) => {
            if (!a.due_date && !b.due_date) return 0;
            if (!a.due_date) return 1;
            if (!b.due_date) return -1;
            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          });
          return { tasks: sortedTasks };
        });
      },

      sortTasksByCreated: () => {
        set(state => {
          const sortedTasks = [...state.tasks].sort((a, b) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
          return { tasks: sortedTasks };
        });
      },

      clearFilters: () => {
        set({ filters: {} });
        get().loadTasks();
      },
    }),
    {
      name: 'task-store',
    }
  )
);
