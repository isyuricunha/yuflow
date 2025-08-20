import { invoke } from '@tauri-apps/api/core';
import type { 
  DatabaseAdapter, 
  Task, 
  Category, 
  Tag, 
  CreateTaskInput, 
  UpdateTaskInput, 
  CreateCategoryInput, 
  TaskFilters 
} from '../../types';

/**
 * Desktop database adapter using Tauri commands to interact with SQLite
 */
export class DesktopDatabaseAdapter implements DatabaseAdapter {
  async initialize(): Promise<void> {
    await invoke('init_database');
  }

  async close(): Promise<void> {
    // SQLite connections are managed by Tauri/Rust side
  }

  // Tasks
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    return await invoke('get_tasks', { filters });
  }

  async getTask(id: number): Promise<Task | null> {
    return await invoke('get_task', { id });
  }

  async createTask(task: CreateTaskInput): Promise<Task> {
    return await invoke('create_task', { task });
  }

  async updateTask(task: UpdateTaskInput): Promise<Task> {
    return await invoke('update_task', { task });
  }

  async deleteTask(id: number): Promise<void> {
    await invoke('delete_task', { id });
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await invoke('get_categories');
  }

  async getCategory(id: number): Promise<Category | null> {
    return await invoke('get_category', { id });
  }

  async createCategory(category: CreateCategoryInput): Promise<Category> {
    return await invoke('create_category', { category });
  }

  async updateCategory(id: number, updates: Partial<Category>): Promise<Category> {
    return await invoke('update_category', { id, updates });
  }

  async deleteCategory(id: number): Promise<void> {
    await invoke('delete_category', { id });
  }

  // Tags
  async getTags(): Promise<Tag[]> {
    return await invoke('get_tags');
  }

  async getTaskTags(taskId: number): Promise<Tag[]> {
    return await invoke('get_task_tags', { taskId });
  }

  async addTagToTask(taskId: number, tagId: number): Promise<void> {
    await invoke('add_tag_to_task', { taskId, tagId });
  }

  async removeTagFromTask(taskId: number, tagId: number): Promise<void> {
    await invoke('remove_tag_from_task', { taskId, tagId });
  }

  // Settings
  async getSetting(key: string): Promise<string | null> {
    return await invoke('get_setting', { key });
  }

  async setSetting(key: string, value: string): Promise<void> {
    await invoke('set_setting', { key, value });
  }
}
