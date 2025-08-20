// Core data types for the todo application

export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  category_id?: number;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  created_at: string;
}

export interface TaskTag {
  task_id: number;
  tag_id: number;
}

export interface AppSettings {
  key: string;
  value: string;
  updated_at: string;
}

// API types for database operations
export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  category_id?: number;
  due_date?: string;
}

export interface UpdateTaskInput {
  id: number;
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: Priority;
  category_id?: number;
  due_date?: string;
}

export interface CreateCategoryInput {
  name: string;
  color?: string;
}

// Filter and search types
export interface TaskFilters {
  completed?: boolean;
  priority?: Priority;
  category_id?: number;
  due_date?: string;
  search?: string;
  dateRange?: 'today' | 'week' | 'month' | 'all';
  status?: 'all' | 'pending' | 'completed';
  due_date_before?: string;
  due_date_after?: string;
}

// Platform detection
export type Platform = 'desktop' | 'web';

// Database adapter interface
export interface DatabaseAdapter {
  // Tasks
  getTasks(filters?: TaskFilters): Promise<Task[]>;
  getTask(id: number): Promise<Task | null>;
  createTask(task: CreateTaskInput): Promise<Task>;
  updateTask(task: UpdateTaskInput): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | null>;
  createCategory(category: CreateCategoryInput): Promise<Category>;
  updateCategory(id: number, updates: Partial<Category>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  
  // Tags
  getTags(): Promise<Tag[]>;
  getTaskTags(taskId: number): Promise<Tag[]>;
  addTagToTask(taskId: number, tagId: number): Promise<void>;
  removeTagFromTask(taskId: number, tagId: number): Promise<void>;
  
  // Settings
  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<void>;
  
  // Database management
  initialize(): Promise<void>;
  close(): Promise<void>;
}

// Store types for Zustand
export interface TaskStore {
  tasks: Task[];
  categories: Category[];
  tags: Tag[];
  filters: TaskFilters;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadTasks: () => Promise<void>;
  addTask: (task: CreateTaskInput) => Promise<void>;
  updateTask: (task: UpdateTaskInput) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  toggleTask: (id: number) => Promise<void>;
  
  loadCategories: () => Promise<void>;
  addCategory: (category: CreateCategoryInput) => Promise<void>;
  updateCategory: (id: number, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  
  setFilters: (filters: Partial<TaskFilters>) => void;
  clearFilters: () => void;
  
  // Search and sorting
  searchTasks: (query: string) => Promise<void>;
  sortTasksByPriority: () => void;
  sortTasksByDueDate: () => void;
  sortTasksByCreated: () => void;
  sortTasksAlphabetically: () => void;
  applyAdvancedFilters: (filters: TaskFilters) => void;
  
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export interface UIStore {
  sidebarOpen: boolean;
  darkMode: boolean;
  currentView: 'all' | 'today' | 'completed' | 'categories';
  selectedTasks: Set<number>;
  bulkMode: boolean;
  setSidebarOpen: (open: boolean) => void;
  setDarkMode: (dark: boolean) => void;
  setCurrentView: (view: 'all' | 'today' | 'completed' | 'categories') => void;
  toggleTaskSelection: (taskId: number) => void;
  selectAllTasks: (taskIds: number[]) => void;
  clearSelection: () => void;
  setBulkMode: (enabled: boolean) => void;
  
  // Sorting and View
  sortBy: 'priority' | 'dueDate' | 'created' | 'alphabetical' | null;
  setSortBy: (sortBy: 'priority' | 'dueDate' | 'created' | 'alphabetical' | null) => void;
  viewMode: 'list' | 'grid' | 'compact';
  setViewMode: (viewMode: 'list' | 'grid' | 'compact') => void;
  
  // Search and Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilters: TaskFilters;
  setActiveFilters: (filters: Partial<TaskFilters>) => void;
}
