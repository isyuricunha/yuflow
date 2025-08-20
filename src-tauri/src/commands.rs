use tauri::State;
use std::sync::Mutex;
use crate::database::Database;
use crate::models::*;
use crate::backup::{BackupManager, BackupMetadata};
use validator::Validate;

type DatabaseState<'a> = State<'a, Mutex<Option<Database>>>;

#[tauri::command]
pub async fn init_database(
    app_handle: tauri::AppHandle,
    db_state: DatabaseState<'_>,
) -> Result<(), String> {
    let database = Database::new(&app_handle)
        .await
        .map_err(|e| format!("Failed to initialize database: {}", e))?;
    
    let mut db_guard = db_state.lock().unwrap();
    *db_guard = Some(database);
    
    Ok(())
}

#[tauri::command]
pub async fn get_tasks(
    filters: Option<TaskFilters>,
    db_state: DatabaseState<'_>,
) -> Result<Vec<Task>, String> {
    let db = {
        let guard = db_state.lock().unwrap();
        guard
            .as_ref()
            .cloned()
            .ok_or("Database not initialized")?
    };
    
    db.get_tasks(filters)
        .await
        .map_err(|e| format!("Failed to get tasks: {}", e))
}

#[tauri::command]
pub async fn get_task(
    id: i64,
    db_state: DatabaseState<'_>,
) -> Result<Option<Task>, String> {
    let db = {
        let guard = db_state.lock().unwrap();
        guard
            .as_ref()
            .cloned()
            .ok_or("Database not initialized")?
    };
    
    db.get_task(id)
        .await
        .map_err(|e| format!("Failed to get task: {}", e))
}

#[tauri::command]
pub async fn create_task(
    task: CreateTaskInput,
    db_state: DatabaseState<'_>,
) -> Result<Task, String> {
    // Validate input
    task.validate()
        .map_err(|e| format!("Validation error: {}", e))?;
    
    let db = {
        let guard = db_state.lock().unwrap();
        guard
            .as_ref()
            .cloned()
            .ok_or("Database not initialized")?
    };
    
    db.create_task(task)
        .await
        .map_err(|e| format!("Failed to create task: {}", e))
}

#[tauri::command]
pub async fn update_task(
    task: UpdateTaskInput,
    db_state: DatabaseState<'_>,
) -> Result<Task, String> {
    let db = {
        let guard = db_state.lock().unwrap();
        guard
            .as_ref()
            .cloned()
            .ok_or("Database not initialized")?
    };
    
    db.update_task(task)
        .await
        .map_err(|e| format!("Failed to update task: {}", e))
}

#[tauri::command]
pub async fn delete_task(
    id: i64,
    db_state: DatabaseState<'_>,
) -> Result<(), String> {
    let db = {
        let guard = db_state.lock().unwrap();
        guard
            .as_ref()
            .cloned()
            .ok_or("Database not initialized")?
    };
    
    db.delete_task(id)
        .await
        .map_err(|e| format!("Failed to delete task: {}", e))
}

#[tauri::command]
pub async fn get_categories(
    db_state: DatabaseState<'_>,
) -> Result<Vec<Category>, String> {
    let db = {
        let guard = db_state.lock().unwrap();
        guard
            .as_ref()
            .cloned()
            .ok_or("Database not initialized")?
    };
    
    db.get_categories()
        .await
        .map_err(|e| format!("Failed to get categories: {}", e))
}

#[tauri::command]
pub async fn create_category(
    category: CreateCategoryInput,
    db_state: DatabaseState<'_>,
) -> Result<Category, String> {
    // Validate input
    category.validate()
        .map_err(|e| format!("Validation error: {}", e))?;
    
    let db = {
        let guard = db_state.lock().unwrap();
        guard
            .as_ref()
            .cloned()
            .ok_or("Database not initialized")?
    };
    
    db.create_category(category)
        .await
        .map_err(|e| format!("Failed to create category: {}", e))
}

#[tauri::command]
pub async fn delete_category(
    id: i64,
    db_state: DatabaseState<'_>,
) -> Result<(), String> {
    let db = {
        let guard = db_state.lock().unwrap();
        guard
            .as_ref()
            .cloned()
            .ok_or("Database not initialized")?
    };
    
    db.delete_category(id)
        .await
        .map_err(|e| format!("Failed to delete category: {}", e))
}

#[tauri::command]
pub async fn get_setting(
    key: String,
    db_state: DatabaseState<'_>,
) -> Result<Option<String>, String> {
    let db = {
        let guard = db_state.lock().unwrap();
        guard
            .as_ref()
            .cloned()
            .ok_or("Database not initialized")?
    };
    
    db.get_setting(&key)
        .await
        .map_err(|e| format!("Failed to get setting: {}", e))
}

#[tauri::command]
pub async fn set_setting(
    key: String,
    value: String,
    db_state: DatabaseState<'_>,
) -> Result<(), String> {
    let db = {
        let guard = db_state.lock().unwrap();
        guard
            .as_ref()
            .cloned()
            .ok_or("Database not initialized")?
    };
    
    db.set_setting(&key, &value)
        .await
        .map_err(|e| format!("Failed to set setting: {}", e))
}

// Backup commands
#[tauri::command]
pub async fn create_backup(
    app_handle: tauri::AppHandle,
    db_state: DatabaseState<'_>,
) -> Result<BackupMetadata, String> {
    let db = {
        let guard = db_state.lock().unwrap();
        guard
            .as_ref()
            .cloned()
            .ok_or("Database not initialized")?
    };
    
    let backup_manager = BackupManager::new(&app_handle)
        .map_err(|e| format!("Failed to initialize backup manager: {}", e))?;
    
    backup_manager.create_backup(&db)
        .await
        .map_err(|e| format!("Failed to create backup: {}", e))
}

#[tauri::command]
pub async fn restore_backup(
    app_handle: tauri::AppHandle,
    filename: String,
    db_state: DatabaseState<'_>,
) -> Result<(), String> {
    let db = {
        let guard = db_state.lock().unwrap();
        guard
            .as_ref()
            .cloned()
            .ok_or("Database not initialized")?
    };
    
    let backup_manager = BackupManager::new(&app_handle)
        .map_err(|e| format!("Failed to initialize backup manager: {}", e))?;
    
    backup_manager.restore_backup(&filename, &db)
        .await
        .map_err(|e| format!("Failed to restore backup: {}", e))
}

#[tauri::command]
pub async fn list_backups(
    app_handle: tauri::AppHandle,
) -> Result<Vec<BackupMetadata>, String> {
    let backup_manager = BackupManager::new(&app_handle)
        .map_err(|e| format!("Failed to initialize backup manager: {}", e))?;
    
    backup_manager.list_backups()
        .map_err(|e| format!("Failed to list backups: {}", e))
}

#[tauri::command]
pub async fn delete_backup(
    app_handle: tauri::AppHandle,
    filename: String,
) -> Result<(), String> {
    let backup_manager = BackupManager::new(&app_handle)
        .map_err(|e| format!("Failed to initialize backup manager: {}", e))?;
    
    backup_manager.delete_backup(&filename)
        .map_err(|e| format!("Failed to delete backup: {}", e))
}
