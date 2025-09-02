mod commands;
mod database;
mod models;
mod backup;

#[cfg(test)]
mod tests;

use std::sync::Mutex;
use commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .manage(Mutex::new(None::<database::Database>))
        .invoke_handler(tauri::generate_handler![
            init_database,
            get_tasks,
            get_task,
            create_task,
            update_task,
            delete_task,
            get_categories,
            create_category,
            delete_category,
            get_setting,
            set_setting,
            create_backup,
            restore_backup,
            list_backups,
            delete_backup
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
