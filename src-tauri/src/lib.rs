mod models;
mod database;
mod commands;

use std::sync::Mutex;
use commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
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
            set_setting
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
