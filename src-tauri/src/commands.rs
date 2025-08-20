use tauri::State;
use std::sync::Mutex;
use crate::database::Database;
use crate::models::*;

type DatabaseState = State<'_, Mutex<Option<Database>>>;

#[tauri::command]
pub async fn init_database(
    app_handle: tauri::AppHandle,
    db_state: DatabaseState,
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
    db_state: DatabaseState,
) -> Result<Vec<Task>, String> {
    let db_guard = db_state.lock().unwrap();
    let db = db_guard
        .as_ref()
        .ok_or("Database not initialized")?;
    
    db.get_tasks(filters)
        .await
        .map_err(|e| format!("Failed to get tasks: {}", e))
}

#[tauri::command]
pub async fn get_task(
    id: i64,
    db_state: DatabaseState,
) -> Result<Option<Task>, String> {
    let db_guard = db_state.lock().unwrap();
    let db = db_guard
        .as_ref()
        .ok_or("Database not initialized")?;
    
    db.get_task(id)
        .await
        .map_err(|e| format!("Failed to get task: {}", e))
}

#[tauri::command]
pub async fn create_task(
    task: CreateTaskInput,
    db_state: DatabaseState,
) -> Result<Task, String> {
    let db_guard = db_state.lock().unwrap();
    let db = db_guard
        .as_ref()
        .ok_or("Database not initialized")?;
    
    db.create_task(task)
        .await
        .map_err(|e| format!("Failed to create task: {}", e))
}

#[tauri::command]
pub async fn update_task(
    task: UpdateTaskInput,
    db_state: DatabaseState,
) -> Result<Task, String> {
    let db_guard = db_state.lock().unwrap();
    let db = db_guard
        .as_ref()
        .ok_or("Database not initialized")?;
    
    db.update_task(task)
        .await
        .map_err(|e| format!("Failed to update task: {}", e))
}

#[tauri::command]
pub async fn delete_task(
    id: i64,
    db_state: DatabaseState,
) -> Result<(), String> {
    let db_guard = db_state.lock().unwrap();
    let db = db_guard
        .as_ref()
        .ok_or("Database not initialized")?;
    
    db.delete_task(id)
        .await
        .map_err(|e| format!("Failed to delete task: {}", e))
}

#[tauri::command]
pub async fn get_categories(
    db_state: DatabaseState,
) -> Result<Vec<Category>, String> {
    let db_guard = db_state.lock().unwrap();
    let db = db_guard
        .as_ref()
        .ok_or("Database not initialized")?;
    
    db.get_categories()
        .await
        .map_err(|e| format!("Failed to get categories: {}", e))
}

#[tauri::command]
pub async fn create_category(
    category: CreateCategoryInput,
    db_state: DatabaseState,
) -> Result<Category, String> {
    let db_guard = db_state.lock().unwrap();
    let db = db_guard
        .as_ref()
        .ok_or("Database not initialized")?;
    
    db.create_category(category)
        .await
        .map_err(|e| format!("Failed to create category: {}", e))
}

#[tauri::command]
pub async fn delete_category(
    id: i64,
    db_state: DatabaseState,
) -> Result<(), String> {
    let db_guard = db_state.lock().unwrap();
    let db = db_guard
        .as_ref()
        .ok_or("Database not initialized")?;
    
    db.delete_category(id)
        .await
        .map_err(|e| format!("Failed to delete category: {}", e))
}

#[tauri::command]
pub async fn get_setting(
    key: String,
    db_state: DatabaseState,
) -> Result<Option<String>, String> {
    let db_guard = db_state.lock().unwrap();
    let db = db_guard
        .as_ref()
        .ok_or("Database not initialized")?;
    
    db.get_setting(&key)
        .await
        .map_err(|e| format!("Failed to get setting: {}", e))
}

#[tauri::command]
pub async fn set_setting(
    key: String,
    value: String,
    db_state: DatabaseState,
) -> Result<(), String> {
    let db_guard = db_state.lock().unwrap();
    let db = db_guard
        .as_ref()
        .ok_or("Database not initialized")?;
    
    db.set_setting(&key, &value)
        .await
        .map_err(|e| format!("Failed to set setting: {}", e))
}
