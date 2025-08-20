use sqlx::{sqlite::SqlitePool, Row};
use std::path::PathBuf;
use tauri::AppHandle;
use crate::models::*;

pub struct Database {
    pool: SqlitePool,
}

impl Database {
    pub async fn new(app_handle: &AppHandle) -> Result<Self, sqlx::Error> {
        let app_dir = app_handle
            .path()
            .app_data_dir()
            .expect("Failed to get app data directory");
        
        std::fs::create_dir_all(&app_dir).expect("Failed to create app data directory");
        
        let database_path = app_dir.join("yuflow.db");
        let database_url = format!("sqlite:{}", database_path.display());
        
        let pool = SqlitePool::connect(&database_url).await?;
        
        // Run migrations
        sqlx::migrate!("./migrations").run(&pool).await?;
        
        Ok(Database { pool })
    }

    // Task operations
    pub async fn get_tasks(&self, filters: Option<TaskFilters>) -> Result<Vec<Task>, sqlx::Error> {
        let mut query = "SELECT id, title, description, completed, priority, category_id, due_date, created_at, updated_at FROM tasks WHERE 1=1".to_string();
        let mut conditions = Vec::new();
        
        if let Some(filters) = filters {
            if let Some(completed) = filters.completed {
                conditions.push(format!("completed = {}", completed as i32));
            }
            if let Some(priority) = filters.priority {
                conditions.push(format!("priority = '{}'", priority));
            }
            if let Some(category_id) = filters.category_id {
                conditions.push(format!("category_id = {}", category_id));
            }
            if let Some(search) = filters.search {
                conditions.push(format!("(title LIKE '%{}%' OR description LIKE '%{}%')", search, search));
            }
        }
        
        if !conditions.is_empty() {
            query.push_str(" AND ");
            query.push_str(&conditions.join(" AND "));
        }
        
        query.push_str(" ORDER BY created_at DESC");
        
        let rows = sqlx::query(&query).fetch_all(&self.pool).await?;
        
        let tasks = rows.into_iter().map(|row| Task {
            id: row.get("id"),
            title: row.get("title"),
            description: row.get("description"),
            completed: row.get::<i32, _>("completed") != 0,
            priority: row.get("priority"),
            category_id: row.get("category_id"),
            due_date: row.get("due_date"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        }).collect();
        
        Ok(tasks)
    }

    pub async fn get_task(&self, id: i64) -> Result<Option<Task>, sqlx::Error> {
        let row = sqlx::query("SELECT id, title, description, completed, priority, category_id, due_date, created_at, updated_at FROM tasks WHERE id = ?")
            .bind(id)
            .fetch_optional(&self.pool)
            .await?;
        
        if let Some(row) = row {
            Ok(Some(Task {
                id: row.get("id"),
                title: row.get("title"),
                description: row.get("description"),
                completed: row.get::<i32, _>("completed") != 0,
                priority: row.get("priority"),
                category_id: row.get("category_id"),
                due_date: row.get("due_date"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            }))
        } else {
            Ok(None)
        }
    }

    pub async fn create_task(&self, input: CreateTaskInput) -> Result<Task, sqlx::Error> {
        let now = chrono::Utc::now().to_rfc3339();
        let priority = input.priority.unwrap_or_else(|| "medium".to_string());
        
        let result = sqlx::query(
            "INSERT INTO tasks (title, description, completed, priority, category_id, due_date, created_at, updated_at) 
             VALUES (?, ?, 0, ?, ?, ?, ?, ?)"
        )
        .bind(&input.title)
        .bind(&input.description)
        .bind(&priority)
        .bind(input.category_id)
        .bind(&input.due_date)
        .bind(&now)
        .bind(&now)
        .execute(&self.pool)
        .await?;
        
        let id = result.last_insert_rowid();
        
        Ok(Task {
            id,
            title: input.title,
            description: input.description,
            completed: false,
            priority,
            category_id: input.category_id,
            due_date: input.due_date,
            created_at: now.clone(),
            updated_at: now,
        })
    }

    pub async fn update_task(&self, input: UpdateTaskInput) -> Result<Task, sqlx::Error> {
        let now = chrono::Utc::now().to_rfc3339();
        
        // Build dynamic update query
        let mut set_clauses = vec!["updated_at = ?".to_string()];
        let mut values: Vec<Box<dyn sqlx::Encode<'_, sqlx::Sqlite> + Send + Sync>> = vec![Box::new(now.clone())];
        
        if let Some(title) = &input.title {
            set_clauses.push("title = ?".to_string());
            values.push(Box::new(title.clone()));
        }
        if let Some(description) = &input.description {
            set_clauses.push("description = ?".to_string());
            values.push(Box::new(description.clone()));
        }
        if let Some(completed) = input.completed {
            set_clauses.push("completed = ?".to_string());
            values.push(Box::new(completed as i32));
        }
        if let Some(priority) = &input.priority {
            set_clauses.push("priority = ?".to_string());
            values.push(Box::new(priority.clone()));
        }
        if let Some(category_id) = input.category_id {
            set_clauses.push("category_id = ?".to_string());
            values.push(Box::new(category_id));
        }
        if let Some(due_date) = &input.due_date {
            set_clauses.push("due_date = ?".to_string());
            values.push(Box::new(due_date.clone()));
        }
        
        let query = format!("UPDATE tasks SET {} WHERE id = ?", set_clauses.join(", "));
        
        let mut query_builder = sqlx::query(&query);
        for value in values {
            // Note: This is a simplified approach. In practice, you'd need proper parameter binding
        }
        
        // For now, let's use a simpler approach with individual fields
        sqlx::query(
            "UPDATE tasks SET 
             title = COALESCE(?, title),
             description = COALESCE(?, description),
             completed = COALESCE(?, completed),
             priority = COALESCE(?, priority),
             category_id = COALESCE(?, category_id),
             due_date = COALESCE(?, due_date),
             updated_at = ?
             WHERE id = ?"
        )
        .bind(&input.title)
        .bind(&input.description)
        .bind(input.completed.map(|c| c as i32))
        .bind(&input.priority)
        .bind(input.category_id)
        .bind(&input.due_date)
        .bind(&now)
        .bind(input.id)
        .execute(&self.pool)
        .await?;
        
        self.get_task(input.id).await.map(|opt| opt.unwrap())
    }

    pub async fn delete_task(&self, id: i64) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM task_tags WHERE task_id = ?")
            .bind(id)
            .execute(&self.pool)
            .await?;
        
        sqlx::query("DELETE FROM tasks WHERE id = ?")
            .bind(id)
            .execute(&self.pool)
            .await?;
        
        Ok(())
    }

    // Category operations
    pub async fn get_categories(&self) -> Result<Vec<Category>, sqlx::Error> {
        let rows = sqlx::query("SELECT id, name, color, created_at FROM categories ORDER BY name")
            .fetch_all(&self.pool)
            .await?;
        
        let categories = rows.into_iter().map(|row| Category {
            id: row.get("id"),
            name: row.get("name"),
            color: row.get("color"),
            created_at: row.get("created_at"),
        }).collect();
        
        Ok(categories)
    }

    pub async fn create_category(&self, input: CreateCategoryInput) -> Result<Category, sqlx::Error> {
        let now = chrono::Utc::now().to_rfc3339();
        let color = input.color.unwrap_or_else(|| "#F97316".to_string());
        
        let result = sqlx::query(
            "INSERT INTO categories (name, color, created_at) VALUES (?, ?, ?)"
        )
        .bind(&input.name)
        .bind(&color)
        .bind(&now)
        .execute(&self.pool)
        .await?;
        
        let id = result.last_insert_rowid();
        
        Ok(Category {
            id,
            name: input.name,
            color,
            created_at: now,
        })
    }

    pub async fn delete_category(&self, id: i64) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE tasks SET category_id = NULL WHERE category_id = ?")
            .bind(id)
            .execute(&self.pool)
            .await?;
        
        sqlx::query("DELETE FROM categories WHERE id = ?")
            .bind(id)
            .execute(&self.pool)
            .await?;
        
        Ok(())
    }

    // Settings operations
    pub async fn get_setting(&self, key: &str) -> Result<Option<String>, sqlx::Error> {
        let row = sqlx::query("SELECT value FROM app_settings WHERE key = ?")
            .bind(key)
            .fetch_optional(&self.pool)
            .await?;
        
        Ok(row.map(|r| r.get("value")))
    }

    pub async fn set_setting(&self, key: &str, value: &str) -> Result<(), sqlx::Error> {
        let now = chrono::Utc::now().to_rfc3339();
        
        sqlx::query(
            "INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)"
        )
        .bind(key)
        .bind(value)
        .bind(&now)
        .execute(&self.pool)
        .await?;
        
        Ok(())
    }
}
