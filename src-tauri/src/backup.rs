use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use crate::models::*;
use crate::database::Database;

#[derive(Debug, Serialize, Deserialize)]
pub struct BackupData {
    pub version: String,
    pub created_at: String,
    pub tasks: Vec<Task>,
    pub categories: Vec<Category>,
    pub settings: Vec<AppSetting>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BackupMetadata {
    pub filename: String,
    pub created_at: String,
    pub size_bytes: u64,
    pub task_count: usize,
    pub category_count: usize,
}

pub struct BackupManager {
    backup_dir: PathBuf,
}

impl BackupManager {
    pub fn new(app_handle: &tauri::AppHandle) -> Result<Self, std::io::Error> {
        let app_dir = app_handle
            .path()
            .app_data_dir()
            .expect("Failed to get app data directory");
        
        let backup_dir = app_dir.join("backups");
        std::fs::create_dir_all(&backup_dir)?;
        
        Ok(BackupManager { backup_dir })
    }

    pub async fn create_backup(&self, database: &Database) -> Result<BackupMetadata, Box<dyn std::error::Error>> {
        let now = Utc::now();
        let timestamp = now.format("%Y%m%d_%H%M%S").to_string();
        let filename = format!("yuflow_backup_{}.json", timestamp);
        let backup_path = self.backup_dir.join(&filename);

        // Collect all data
        let tasks = database.get_tasks(None).await?;
        let categories = database.get_categories().await?;
        let settings = database.get_all_settings().await?;

        let backup_data = BackupData {
            version: "1.0.0".to_string(),
            created_at: now.to_rfc3339(),
            tasks: tasks.clone(),
            categories: categories.clone(),
            settings,
        };

        // Write backup file
        let json_data = serde_json::to_string_pretty(&backup_data)?;
        std::fs::write(&backup_path, &json_data)?;

        // Get file size
        let metadata = std::fs::metadata(&backup_path)?;
        
        Ok(BackupMetadata {
            filename,
            created_at: now.to_rfc3339(),
            size_bytes: metadata.len(),
            task_count: tasks.len(),
            category_count: categories.len(),
        })
    }

    pub async fn restore_backup(&self, filename: &str, database: &Database) -> Result<(), Box<dyn std::error::Error>> {
        let backup_path = self.backup_dir.join(filename);
        let json_data = std::fs::read_to_string(backup_path)?;
        let backup_data: BackupData = serde_json::from_str(&json_data)?;

        // Clear existing data (in a transaction)
        database.clear_all_data().await?;

        // Restore categories first (due to foreign key constraints)
        for category in backup_data.categories {
            let input = CreateCategoryInput {
                name: category.name,
                color: Some(category.color),
            };
            database.create_category(input).await?;
        }

        // Restore tasks
        for task in backup_data.tasks {
            let input = CreateTaskInput {
                title: task.title,
                description: task.description,
                priority: Some(task.priority),
                category_id: task.category_id,
                due_date: task.due_date,
            };
            let mut created_task = database.create_task(input).await?;
            
            // Update completion status if needed
            if task.completed {
                database.update_task(UpdateTaskInput {
                    id: created_task.id,
                    title: None,
                    description: None,
                    completed: Some(true),
                    priority: None,
                    category_id: None,
                    due_date: None,
                }).await?;
            }
        }

        // Restore settings
        for setting in backup_data.settings {
            database.set_setting(&setting.key, &setting.value).await?;
        }

        Ok(())
    }

    pub fn list_backups(&self) -> Result<Vec<BackupMetadata>, std::io::Error> {
        let mut backups = Vec::new();
        
        for entry in std::fs::read_dir(&self.backup_dir)? {
            let entry = entry?;
            let path = entry.path();
            
            if path.extension().and_then(|s| s.to_str()) == Some("json") {
                if let Some(filename) = path.file_name().and_then(|s| s.to_str()) {
                    if filename.starts_with("yuflow_backup_") {
                        let metadata = std::fs::metadata(&path)?;
                        
                        // Try to extract timestamp from filename
                        let created_at = if let Some(timestamp_part) = filename.strip_prefix("yuflow_backup_").and_then(|s| s.strip_suffix(".json")) {
                            // Parse timestamp format: YYYYMMDD_HHMMSS
                            if let Ok(dt) = chrono::NaiveDateTime::parse_from_str(timestamp_part, "%Y%m%d_%H%M%S") {
                                dt.and_utc().to_rfc3339()
                            } else {
                                metadata.modified()
                                    .unwrap_or(std::time::SystemTime::UNIX_EPOCH)
                                    .duration_since(std::time::SystemTime::UNIX_EPOCH)
                                    .unwrap()
                                    .as_secs()
                                    .to_string()
                            }
                        } else {
                            metadata.modified()
                                .unwrap_or(std::time::SystemTime::UNIX_EPOCH)
                                .duration_since(std::time::SystemTime::UNIX_EPOCH)
                                .unwrap()
                                .as_secs()
                                .to_string()
                        };

                        // Try to read backup to get counts
                        let (task_count, category_count) = if let Ok(json_data) = std::fs::read_to_string(&path) {
                            if let Ok(backup_data) = serde_json::from_str::<BackupData>(&json_data) {
                                (backup_data.tasks.len(), backup_data.categories.len())
                            } else {
                                (0, 0)
                            }
                        } else {
                            (0, 0)
                        };

                        backups.push(BackupMetadata {
                            filename: filename.to_string(),
                            created_at,
                            size_bytes: metadata.len(),
                            task_count,
                            category_count,
                        });
                    }
                }
            }
        }

        // Sort by creation time (newest first)
        backups.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        
        Ok(backups)
    }

    pub fn delete_backup(&self, filename: &str) -> Result<(), std::io::Error> {
        let backup_path = self.backup_dir.join(filename);
        std::fs::remove_file(backup_path)
    }

    pub fn get_backup_dir(&self) -> &PathBuf {
        &self.backup_dir
    }
}
