import Dexie, { Table } from 'dexie';
import type { 
  DatabaseAdapter, 
  Task, 
  Category, 
  Tag, 
  TaskTag,
  AppSettings,
  CreateTaskInput, 
  UpdateTaskInput, 
  CreateCategoryInput, 
  TaskFilters 
} from '../../types';

interface YuflowDB extends Dexie {
  tasks: Table<Task>;
  categories: Table<Category>;
  tags: Table<Tag>;
  task_tags: Table<TaskTag>;
  app_settings: Table<AppSettings>;
}

/**
 * Web database adapter using IndexedDB via Dexie
 */
export class WebDatabaseAdapter implements DatabaseAdapter {
  private db: YuflowDB;

  constructor() {
    this.db = new Dexie('YuflowDB') as YuflowDB;
    
    this.db.version(1).stores({
      tasks: '++id, title, completed, priority, category_id, due_date, created_at, updated_at',
      categories: '++id, name, color, created_at',
      tags: '++id, name, created_at',
      task_tags: '[task_id+tag_id], task_id, tag_id',
      app_settings: 'key, value, updated_at'
    });
  }

  async initialize(): Promise<void> {
    await this.db.open();
    
    // Create default category if none exist
    const categoriesCount = await this.db.categories.count();
    if (categoriesCount === 0) {
      await this.db.categories.add({
        id: 1,
        name: 'General',
        color: '#F97316',
        created_at: new Date().toISOString()
      });
    }
  }

  async close(): Promise<void> {
    this.db.close();
  }

  // Tasks
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    let query = this.db.tasks.orderBy('created_at').reverse();
    
    if (filters) {
      if (filters.completed !== undefined) {
        query = query.filter(task => task.completed === filters.completed);
      }
      if (filters.priority) {
        query = query.filter(task => task.priority === filters.priority);
      }
      if (filters.category_id) {
        query = query.filter(task => task.category_id === filters.category_id);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        query = query.filter(task => {
          const titleMatch = task.title.toLowerCase().includes(searchLower);
          const descMatch = task.description ? task.description.toLowerCase().includes(searchLower) : false;
          return titleMatch || descMatch;
        });
      }
      
      // Date range filtering
      if (filters.dateRange) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        query = query.filter(task => {
          if (!task.due_date) return filters.dateRange === 'all';
          const taskDate = new Date(task.due_date);
          
          switch (filters.dateRange) {
            case 'today':
              return taskDate >= today && taskDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
            case 'week':
              const weekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
              const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
              return taskDate >= weekStart && taskDate < weekEnd;
            case 'month':
              const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
              const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
              return taskDate >= monthStart && taskDate < monthEnd;
            default:
              return true;
          }
        });
      }
    }
    
    return await query.toArray();
  }

  async getTask(id: number): Promise<Task | null> {
    return await this.db.tasks.get(id) || null;
  }

  async createTask(taskInput: CreateTaskInput): Promise<Task> {
    const now = new Date().toISOString();
    const task: Omit<Task, 'id'> = {
      title: taskInput.title,
      description: taskInput.description,
      completed: false,
      priority: taskInput.priority || 'medium',
      category_id: taskInput.category_id,
      due_date: taskInput.due_date,
      created_at: now,
      updated_at: now
    };
    
    const id = await this.db.tasks.add(task as Task);
    return { ...task, id } as Task;
  }

  async updateTask(taskUpdate: UpdateTaskInput): Promise<Task> {
    const now = new Date().toISOString();
    const { id, ...updates } = { ...taskUpdate, updated_at: now };
    
    await this.db.tasks.update(taskUpdate.id, updates);
    const updatedTask = await this.db.tasks.get(taskUpdate.id);
    
    if (!updatedTask) {
      throw new Error(`Task with id ${taskUpdate.id} not found`);
    }
    
    return updatedTask;
  }

  async deleteTask(id: number): Promise<void> {
    await this.db.task_tags.where('task_id').equals(id).delete();
    await this.db.tasks.delete(id);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await this.db.categories.orderBy('name').toArray();
  }

  async getCategory(id: number): Promise<Category | null> {
    return await this.db.categories.get(id) || null;
  }

  async createCategory(categoryInput: CreateCategoryInput): Promise<Category> {
    const now = new Date().toISOString();
    const category: Omit<Category, 'id'> = {
      name: categoryInput.name,
      color: categoryInput.color || '#F97316',
      created_at: now
    };
    
    const id = await this.db.categories.add(category as Category);
    return { ...category, id } as Category;
  }

  async updateCategory(id: number, updates: Partial<Category>): Promise<Category> {
    await this.db.categories.update(id, updates);
    const updatedCategory = await this.db.categories.get(id);
    
    if (!updatedCategory) {
      throw new Error(`Category with id ${id} not found`);
    }
    
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    // Update tasks to remove category reference
    await this.db.tasks.where('category_id').equals(id).modify({ category_id: undefined });
    await this.db.categories.delete(id);
  }

  // Tags
  async getTags(): Promise<Tag[]> {
    return await this.db.tags.orderBy('name').toArray();
  }

  async getTaskTags(taskId: number): Promise<Tag[]> {
    const taskTagRelations = await this.db.task_tags.where('task_id').equals(taskId).toArray();
    const tagIds = taskTagRelations.map(relation => relation.tag_id);
    return await this.db.tags.where('id').anyOf(tagIds).toArray();
  }

  async addTagToTask(taskId: number, tagId: number): Promise<void> {
    await this.db.task_tags.put({ task_id: taskId, tag_id: tagId });
  }

  async removeTagFromTask(taskId: number, tagId: number): Promise<void> {
    await this.db.task_tags.where({ task_id: taskId, tag_id: tagId }).delete();
  }

  // Settings
  async getSetting(key: string): Promise<string | null> {
    const setting = await this.db.app_settings.get(key);
    return setting?.value || null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    const now = new Date().toISOString();
    await this.db.app_settings.put({
      key,
      value,
      updated_at: now
    });
  }
}
