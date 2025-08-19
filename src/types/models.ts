export type Priority = "low" | "medium" | "high";

export interface Category {
  id: number;
  name: string;
  color?: string; // default #F97316
  created_at: string; // ISO
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  category_id?: number | null;
  due_date?: string | null; // ISO
  created_at: string; // ISO
  updated_at: string; // ISO
}

export interface Tag {
  id: number;
  name: string;
}

export interface TaskTag {
  task_id: number;
  tag_id: number;
}

export interface AppSetting<T = string> {
  key: string;
  value: T;
  updated_at: string; // ISO
}
